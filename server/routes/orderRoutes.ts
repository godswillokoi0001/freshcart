import { Router, Request, Response } from "express"
import { query, getClient } from "../db"
import { authenticateToken, optionalToken, requireRole } from "../auth"
import { sendOrderConfirmationEmail, sendOrderDispatchedEmail, sendOrderDeliveredEmail } from "../email"

export const orderRouter = Router()

// Server-side authoritative checkout
orderRouter.post("/checkout", optionalToken, async (req: Request, res: Response) => {
  const client = await getClient()
  try {
    const {
      items, // [{ productId, quantity }]
      deliveryAddress, // { fullName, phone, line1, line2, city, state }
      deliverySlot,
      deliveryNotes,
      paymentMethod = "Card",
      couponCode,
      guestEmail,
      customerEmail: bodyCustomerEmail,
    } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "Checkout cart cannot be empty" })
      return
    }

    if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.line1) {
      res.status(400).json({ error: "Complete delivery address with full name and phone is required" })
      return
    }

    if (!deliverySlot) {
      res.status(400).json({ error: "Delivery time slot is required" })
      return
    }

    const customerId = req.user?.id || null
    const customerEmail = bodyCustomerEmail || req.user?.email || guestEmail || "customer@freshcart.ng"
    const customerName = deliveryAddress.fullName.trim()
    const customerPhone = deliveryAddress.phone.trim()

    await client.query("BEGIN")

    // 1. Authoritative item pricing & stock reservation
    let calculatedSubtotal = 0
    const verifiedOrderItems: any[] = []

    for (const itm of items) {
      const pRes = await client.query(
        "SELECT id, name, brand, unit, price, stock, stock_status, image_url FROM products WHERE id = $1 AND status = 'ACTIVE' FOR UPDATE;",
        [itm.productId]
      )

      if (pRes.rows.length === 0) {
        throw new Error(`Product ${itm.productId} is no longer available.`)
      }

      const prod = pRes.rows[0]
      const qty = parseInt(itm.quantity, 10)
      if (qty <= 0) continue

      if (prod.stock < qty) {
        throw new Error(`Insufficient stock for "${prod.name}". Only ${prod.stock} remaining in warehouse.`)
      }

      const itemPrice = parseFloat(prod.price)
      calculatedSubtotal += itemPrice * qty

      verifiedOrderItems.push({
        productId: prod.id,
        name: prod.name,
        brand: prod.brand,
        unit: prod.unit,
        price: itemPrice,
        quantity: qty,
        imageUrl: prod.image_url,
      })
    }

    if (verifiedOrderItems.length === 0) {
      throw new Error("No valid items in checkout")
    }

    // 2. Authoritative Coupon Verification
    let calculatedDiscount = 0
    let validCoupon: any = null

    if (couponCode) {
      const cRes = await client.query(
        `SELECT id, code, discount_type, discount_value, min_order, max_discount, expires_at, usage_limit, used_count, status
         FROM coupons
         WHERE code = $1 FOR UPDATE;`,
        [couponCode.toUpperCase().trim()]
      )

      if (cRes.rows.length > 0) {
        const c = cRes.rows[0]
        const notExpired = !c.expires_at || new Date(c.expires_at) > new Date()
        const withinLimit = c.usage_limit === 0 || c.used_count < c.usage_limit
        const meetsMin = calculatedSubtotal >= parseFloat(c.min_order)

        if (c.status === "ACTIVE" && notExpired && withinLimit && meetsMin) {
          validCoupon = c
          if (c.discount_type === "PERCENTAGE") {
            calculatedDiscount = Math.round((calculatedSubtotal * parseFloat(c.discount_value)) / 100)
            if (c.max_discount && calculatedDiscount > parseFloat(c.max_discount)) {
              calculatedDiscount = parseFloat(c.max_discount)
            }
          } else {
            calculatedDiscount = parseFloat(c.discount_value)
          }
          calculatedDiscount = Math.min(calculatedDiscount, calculatedSubtotal)

          // Increment usage count
          await client.query("UPDATE coupons SET used_count = used_count + 1 WHERE id = $1;", [c.id])
        }
      }
    }

    // 3. Delivery Fee Calculation (Free above ₦100,000)
    const deliveryFee = calculatedSubtotal >= 100000 ? 0 : 1500
    const calculatedTotal = Math.max(0, calculatedSubtotal - calculatedDiscount + deliveryFee)

    // 4. Generate Order Number
    const randomSuffix = Math.floor(10000 + Math.random() * 90000)
    const orderNumber = `FC-${randomSuffix}`

    const initialStatus = paymentMethod === "Card" ? "PENDING" : "CONFIRMED"
    const initialPaymentStatus = paymentMethod === "Card" ? "PENDING" : paymentMethod === "Bank Transfer" ? "PENDING" : "UNPAID"

    // 5. Insert Order
    const ordRes = await client.query(
      `INSERT INTO orders (
        order_number, customer_id, customer_name, customer_phone, customer_email,
        subtotal, delivery_fee, discount, total, payment_method, payment_status,
        status, address, delivery_slot, delivery_notes, coupon_code
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16
      ) RETURNING id, order_number, total;`,
      [
        orderNumber,
        customerId,
        customerName,
        customerPhone,
        customerEmail,
        calculatedSubtotal,
        deliveryFee,
        calculatedDiscount,
        calculatedTotal,
        paymentMethod,
        initialPaymentStatus,
        initialStatus,
        JSON.stringify(deliveryAddress),
        deliverySlot,
        deliveryNotes || null,
        validCoupon ? validCoupon.code : null,
      ]
    )

    const orderId = ordRes.rows[0].id

    // Record coupon usage
    if (validCoupon && customerId) {
      await client.query(
        `INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_applied)
         VALUES ($1, $2, $3, $4);`,
        [validCoupon.id, customerId, orderId, calculatedDiscount]
      )
    }

    // 6. Insert Order Items
    for (const item of verifiedOrderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, brand, unit, image_url, price, quantity, picked_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PICKED');`,
        [orderId, item.productId, item.name, item.brand, item.unit, item.imageUrl, item.price, item.quantity]
      )

      // If non-card (confirmed immediately), deduct inventory atomically now
      if (initialStatus === "CONFIRMED") {
        const prod = await client.query("SELECT stock FROM products WHERE id = $1 FOR UPDATE;", [item.productId])
        const currentStock = prod.rows[0].stock
        const newStock = Math.max(0, currentStock - item.quantity)
        const newStatus = newStock === 0 ? "OUT_OF_STOCK" : newStock <= 5 ? "LOW_STOCK" : "IN_STOCK"
        await client.query("UPDATE products SET stock = $1, stock_status = $2, updated_at = NOW() WHERE id = $3;", [
          newStock,
          newStatus,
          item.productId,
        ])
        await client.query(
          `INSERT INTO inventory_transactions (product_id, type, quantity, previous_stock, new_stock, reference_id, notes)
           VALUES ($1, 'SALE_REDUCTION', $2, $3, $4, $5, 'Order checkout deduction');`,
          [item.productId, item.quantity, currentStock, newStock, orderNumber]
        )
      }
    }

    // 7. Insert Timeline Events
    await client.query(
      `INSERT INTO order_timeline (order_id, label, description, completed, current)
       VALUES ($1, 'Order Placed', 'Customer initiated order placement', true, ${initialStatus === "PENDING"});`,
      [orderId]
    )

    if (initialStatus === "CONFIRMED") {
      await client.query(
        `INSERT INTO order_timeline (order_id, label, description, completed, current)
         VALUES ($1, 'Order Confirmed', 'Order confirmed and scheduled for warehouse packing', true, true);`,
        [orderId]
      )
    }

    // 8. Create Initial Delivery Assignment Row
    await client.query(
      `INSERT INTO delivery_assignments (order_id, status, delivery_fee)
       VALUES ($1, 'UNASSIGNED', $2);`,
      [orderId, deliveryFee]
    )

    // 9. Clear user's cart in database if authenticated
    if (customerId) {
      await client.query("DELETE FROM cart_items WHERE user_id = $1;", [customerId])
    }

    // 10. Notification for Customer
    if (customerId) {
      await client.query(
        `INSERT INTO notifications (user_id, title, message, type, read, link)
         VALUES ($1, 'Order Placed Successfully', $2, 'ORDER', false, $3);`,
        [
          customerId,
          `Your order #${orderNumber} for ₦${calculatedTotal.toLocaleString()} was placed.`,
          `/orders/${orderNumber}`,
        ]
      )
    }

    await client.query("COMMIT")

    // Send confirmation email asynchronously
    sendOrderConfirmationEmail(
      customerEmail,
      customerName,
      orderNumber,
      calculatedTotal,
      verifiedOrderItems.length
    ).catch((e) => console.warn("Checkout confirmation email error:", e.message))

    res.status(201).json({
      orderId,
      orderNumber,
      total: calculatedTotal,
      subtotal: calculatedSubtotal,
      deliveryFee,
      discount: calculatedDiscount,
      paymentMethod,
      paymentStatus: initialPaymentStatus,
      status: initialStatus,
    })
  } catch (error: any) {
    await client.query("ROLLBACK")
    console.error("Checkout error:", error)
    res.status(400).json({ error: error.message || "Checkout failed" })
  } finally {
    client.release()
  }
})

// List orders
orderRouter.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user!
    const { status, limit = "50", page = "1" } = req.query

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50))
    const offset = (pageNum - 1) * limitNum

    const conditions: string[] = []
    const params: any[] = []
    let pIdx = 1

    // Role-based scoping: Customers see ONLY their own orders
    if (user.role === "customer") {
      conditions.push(`o.customer_id = $${pIdx++}`)
      params.push(user.id)
    } else if (user.role === "rider") {
      conditions.push(`o.rider_id = $${pIdx++}`)
      params.push(user.id)
    }

    if (status && status !== "ALL") {
      conditions.push(`o.status = $${pIdx++}`)
      params.push(status)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    const listQuery = `
      SELECT o.id, o.order_number as "orderNumber", o.customer_id as "customerId",
             o.customer_name as "customerName", o.customer_phone as "customerPhone",
             o.customer_email as "customerEmail", o.subtotal::float, o.delivery_fee::float as "deliveryFee",
             o.discount::float, o.total::float, o.payment_method as "paymentMethod",
             o.payment_status as "paymentStatus", o.status, o.address,
             o.delivery_slot as "deliverySlot", o.delivery_notes as "deliveryNotes",
             o.rider_id as "riderId", o.rider_name as "riderName", o.coupon_code as "couponCode",
             o.created_at as "createdAt"
      FROM orders o
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${pIdx++} OFFSET $${pIdx++};
    `

    const ordersRes = await query(listQuery, [...params, limitNum, offset])
    const orders = ordersRes.rows

    // Fetch items for all listed orders
    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.id)
      const itemsRes = await query(
        `SELECT order_id as "orderId", product_id as "productId", name, brand, unit,
                image_url as "imageUrl", price::float, quantity, substitution_note as "substitutionNote",
                picked_status as "pickedStatus"
         FROM order_items
         WHERE order_id = ANY($1);`,
        [orderIds]
      )

      const timelineRes = await query(
        `SELECT order_id as "orderId", label, description, timestamp, completed, current
         FROM order_timeline
         WHERE order_id = ANY($1)
         ORDER BY timestamp ASC;`,
        [orderIds]
      )

      const itemsMap: Record<string, any[]> = {}
      const timelineMap: Record<string, any[]> = {}

      for (const itm of itemsRes.rows) {
        if (!itemsMap[itm.orderId]) itemsMap[itm.orderId] = []
        itemsMap[itm.orderId].push(itm)
      }

      for (const t of timelineRes.rows) {
        if (!timelineMap[t.orderId]) timelineMap[t.orderId] = []
        timelineMap[t.orderId].push(t)
      }

      for (const o of orders) {
        o.items = itemsMap[o.id] || []
        o.timeline = timelineMap[o.id] || []
      }
    }

    res.json(orders)
  } catch (error: any) {
    console.error("Fetch orders error:", error)
    res.status(500).json({ error: "Failed to fetch orders" })
  }
})

// Single order details
orderRouter.get("/:idOrNumber", optionalToken, async (req: Request, res: Response) => {
  try {
    const { idOrNumber } = req.params

    const orderRes = await query(
      `SELECT o.id, o.order_number as "orderNumber", o.customer_id as "customerId",
              o.customer_name as "customerName", o.customer_phone as "customerPhone",
              o.customer_email as "customerEmail", o.subtotal::float, o.delivery_fee::float as "deliveryFee",
              o.discount::float, o.total::float, o.payment_method as "paymentMethod",
              o.payment_status as "paymentStatus", o.status, o.address,
              o.delivery_slot as "deliverySlot", o.delivery_notes as "deliveryNotes",
              o.rider_id as "riderId", o.rider_name as "riderName", o.coupon_code as "couponCode",
              o.created_at as "createdAt"
       FROM orders o
       WHERE o.id::text = $1 OR o.order_number = $1
       LIMIT 1;`,
      [idOrNumber]
    )

    if (orderRes.rows.length === 0) {
      res.status(404).json({ error: "Order not found" })
      return
    }

    const order = orderRes.rows[0]

    // Verify customer isolation if authenticated as customer
    if (req.user && req.user.role === "customer" && order.customerId && order.customerId !== req.user.id) {
      res.status(403).json({ error: "Access denied to this order" })
      return
    }

    // Fetch items
    const itemsRes = await query(
      `SELECT product_id as "productId", name, brand, unit, image_url as "imageUrl",
              price::float, quantity, substitution_note as "substitutionNote", picked_status as "pickedStatus"
       FROM order_items
       WHERE order_id = $1;`,
      [order.id]
    )
    order.items = itemsRes.rows

    // Fetch timeline
    const timelineRes = await query(
      `SELECT label, description, timestamp, completed, current
       FROM order_timeline
       WHERE order_id = $1
       ORDER BY timestamp ASC;`,
      [order.id]
    )
    order.timeline = timelineRes.rows

    // Fetch proof of delivery if delivered
    const podRes = await query(
      `SELECT recipient_name as "recipientName", signature_url as "signatureUrl", delivered_at as "deliveredAt"
       FROM proof_of_delivery
       WHERE order_id = $1;`,
      [order.id]
    )
    if (podRes.rows.length > 0) {
      order.proofOfDelivery = podRes.rows[0]
    }

    res.json(order)
  } catch (error: any) {
    console.error("Fetch order details error:", error)
    res.status(500).json({ error: "Failed to fetch order details" })
  }
})

// Update order status (Staff / Admin / Rider)
orderRouter.patch("/:id/status", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, note, riderId, riderName } = req.body

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "PACKED",
      "READY_FOR_PICKUP",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ]

    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: "Invalid status value" })
      return
    }

    const orderRes = await query("SELECT * FROM orders WHERE id = $1 OR order_number = $1;", [id])
    if (orderRes.rows.length === 0) {
      res.status(404).json({ error: "Order not found" })
      return
    }

    const order = orderRes.rows[0]

    // Update order
    await query(
      `UPDATE orders
       SET status = $1,
           rider_id = COALESCE($2, rider_id),
           rider_name = COALESCE($3, rider_name),
           updated_at = NOW()
       WHERE id = $4;`,
      [status, riderId || null, riderName || null, order.id]
    )

    // Mark previous current timeline events as false
    await query("UPDATE order_timeline SET current = false WHERE order_id = $1;", [order.id])

    // Insert new timeline event
    const statusLabels: Record<string, string> = {
      CONFIRMED: "Order Confirmed",
      PREPARING: "Being Prepared",
      PACKED: "Packing Completed",
      READY_FOR_PICKUP: "Ready for Dispatch",
      OUT_FOR_DELIVERY: "Out for Delivery",
      DELIVERED: "Delivered to Customer",
      CANCELLED: "Order Cancelled",
    }

    await query(
      `INSERT INTO order_timeline (order_id, label, description, completed, current)
       VALUES ($1, $2, $3, true, true);`,
      [order.id, statusLabels[status] || status, note || `Status updated to ${status}`]
    )

    // Send notifications and emails
    if (order.customer_id) {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, read, link)
         VALUES ($1, $2, $3, 'ORDER', false, $4);`,
        [
          order.customer_id,
          `Order #${order.order_number} Update`,
          `Your order status is now: ${statusLabels[status] || status}`,
          `/orders/${order.order_number}`,
        ]
      )
    }

    if (status === "OUT_FOR_DELIVERY") {
      sendOrderDispatchedEmail(
        order.customer_email,
        order.customer_name,
        order.order_number,
        riderName || order.rider_name || "Assigned Dispatch Rider"
      ).catch((e) => console.warn("Dispatch email error:", e.message))
    } else if (status === "DELIVERED") {
      sendOrderDeliveredEmail(order.customer_email, order.customer_name, order.order_number).catch((e) =>
        console.warn("Delivered email error:", e.message)
      )
    }

    res.json({ success: true, status, orderNumber: order.order_number })
  } catch (error: any) {
    console.error("Update order status error:", error)
    res.status(500).json({ error: "Failed to update order status" })
  }
})

// Cancel order (Customer or Admin)
orderRouter.post("/:id/cancel", authenticateToken, async (req: Request, res: Response) => {
  const client = await getClient()
  try {
    const { id } = req.params
    const { reason = "Customer requested cancellation" } = req.body
    const user = req.user!

    await client.query("BEGIN")

    const orderRes = await client.query("SELECT * FROM orders WHERE id = $1 OR order_number = $1 FOR UPDATE;", [id])
    if (orderRes.rows.length === 0) {
      res.status(404).json({ error: "Order not found" })
      return
    }

    const order = orderRes.rows[0]

    // Customer can only cancel their own order before it is packed/dispatched
    if (user.role === "customer") {
      if (order.customer_id !== user.id) {
        res.status(403).json({ error: "Unauthorized" })
        return
      }
      if (!["PENDING", "CONFIRMED"].includes(order.status)) {
        res.status(400).json({
          error: "Orders that are already being packed or out for delivery cannot be cancelled online. Please contact support.",
        })
        return
      }
    }

    // Mark status as CANCELLED
    await client.query("UPDATE orders SET status = 'CANCELLED', updated_at = NOW() WHERE id = $1;", [order.id])

    // Restore inventory if stock was already deducted
    const itemsRes = await client.query("SELECT product_id, quantity FROM order_items WHERE order_id = $1;", [
      order.id,
    ])
    for (const itm of itemsRes.rows) {
      const pRes = await client.query("SELECT stock FROM products WHERE id = $1 FOR UPDATE;", [itm.product_id])
      if (pRes.rows.length > 0) {
        const currentStock = pRes.rows[0].stock
        const newStock = currentStock + itm.quantity
        const newStatus = newStock > 5 ? "IN_STOCK" : newStock > 0 ? "LOW_STOCK" : "OUT_OF_STOCK"
        await client.query("UPDATE products SET stock = $1, stock_status = $2, updated_at = NOW() WHERE id = $3;", [
          newStock,
          newStatus,
          itm.product_id,
        ])
        await client.query(
          `INSERT INTO inventory_transactions (product_id, type, quantity, previous_stock, new_stock, reference_id, notes)
           VALUES ($1, 'ORDER_CANCEL_RESTORE', $2, $3, $4, $5, 'Restored from cancelled order');`,
          [itm.product_id, itm.quantity, currentStock, newStock, order.order_number]
        )
      }
    }

    // Add timeline event
    await client.query("UPDATE order_timeline SET current = false WHERE order_id = $1;", [order.id])
    await client.query(
      `INSERT INTO order_timeline (order_id, label, description, completed, current)
       VALUES ($1, 'Order Cancelled', $2, true, true);`,
      [order.id, reason]
    )

    await client.query("COMMIT")

    res.json({ success: true, message: "Order cancelled and inventory restored." })
  } catch (error: any) {
    await client.query("ROLLBACK")
    console.error("Cancel order error:", error)
    res.status(500).json({ error: error.message || "Failed to cancel order" })
  } finally {
    client.release()
  }
})
