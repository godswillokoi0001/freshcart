import { Router, Request, Response } from "express"
import { query, getClient } from "../db"
import { authenticateToken, requireRole } from "../auth"
import { uploadToStorage } from "../supabase"
import { sendOrderDeliveredEmail } from "../email"

export const riderRouter = Router()

// List deliveries assigned to rider
riderRouter.get("/deliveries", authenticateToken, requireRole("admin", "rider"), async (req: Request, res: Response) => {
  try {
    const user = req.user!
    let filterClause = ""
    const params: any[] = []

    if (user.role === "rider") {
      filterClause = "WHERE da.rider_id = $1 OR da.rider_id IS NULL"
      params.push(user.id)
    }

    const result = await query(
      `SELECT da.id, da.order_id as "orderId", da.rider_id as "riderId",
              da.status, da.assigned_at as "assignedAt", da.delivery_fee::float as "deliveryFee",
              o.order_number as "orderNumber", o.customer_name as "customerName",
              o.customer_phone as "customerPhone", o.address, o.delivery_slot as "deliverySlot",
              o.delivery_notes as "deliveryNotes", o.total::float,
              (SELECT COUNT(*) FROM order_items WHERE order_id = o.id)::int as "itemsCount"
       FROM delivery_assignments da
       JOIN orders o ON o.id = da.order_id
       ${filterClause}
       ORDER BY da.created_at DESC;`,
      params
    )

    res.json(result.rows)
  } catch (error: any) {
    console.error("Fetch rider deliveries error:", error)
    res.status(500).json({ error: "Failed to fetch deliveries" })
  }
})

// Get delivery detail
riderRouter.get("/deliveries/:id", authenticateToken, requireRole("admin", "rider"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const result = await query(
      `SELECT da.id, da.order_id as "orderId", da.rider_id as "riderId",
              da.status, da.assigned_at as "assignedAt", da.delivery_fee::float as "deliveryFee",
              o.order_number as "orderNumber", o.customer_name as "customerName",
              o.customer_phone as "customerPhone", o.customer_email as "customerEmail",
              o.address, o.delivery_slot as "deliverySlot", o.delivery_notes as "deliveryNotes",
              o.total::float
       FROM delivery_assignments da
       JOIN orders o ON o.id = da.order_id
       WHERE da.id = $1 OR o.id = $1 OR o.order_number = $1
       LIMIT 1;`,
      [id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Delivery not found" })
      return
    }

    const delivery = result.rows[0]

    // Fetch items
    const itemsRes = await query(
      `SELECT product_id as "productId", name, brand, unit, quantity, price::float
       FROM order_items
       WHERE order_id = $1;`,
      [delivery.orderId]
    )
    delivery.items = itemsRes.rows

    // Fetch proof of delivery if present
    const podRes = await query(
      `SELECT recipient_name as "recipientName", signature_url as "signatureUrl", delivered_at as "deliveredAt"
       FROM proof_of_delivery
       WHERE order_id = $1;`,
      [delivery.orderId]
    )
    if (podRes.rows.length > 0) {
      delivery.proofOfDelivery = podRes.rows[0]
    }

    res.json(delivery)
  } catch (error: any) {
    console.error("Fetch delivery detail error:", error)
    res.status(500).json({ error: "Failed to fetch delivery details" })
  }
})

// Update delivery step status
riderRouter.patch("/deliveries/:id/status", authenticateToken, requireRole("admin", "rider"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const user = req.user!

    const validStatuses = ["ACCEPTED", "GO_TO_STORE", "PICKED_UP", "OUT_FOR_DELIVERY"]
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: "Invalid status" })
      return
    }

    const daRes = await query(
      "SELECT id, order_id FROM delivery_assignments WHERE id = $1 OR order_id = $1;",
      [id]
    )
    if (daRes.rows.length === 0) {
      res.status(404).json({ error: "Delivery assignment not found" })
      return
    }

    const da = daRes.rows[0]

    let timeCol = ""
    if (status === "ACCEPTED") timeCol = ", accepted_at = NOW(), rider_id = $2"
    else if (status === "PICKED_UP") timeCol = ", picked_up_at = NOW()"

    await query(
      `UPDATE delivery_assignments
       SET status = $1 ${timeCol}
       WHERE id = $3;`,
      timeCol.includes("$2") ? [status, user.id, da.id] : [status, da.id]
    )

    if (status === "OUT_FOR_DELIVERY") {
      await query(
        `UPDATE orders
         SET status = 'OUT_FOR_DELIVERY',
             rider_id = $1,
             rider_name = $2,
             updated_at = NOW()
         WHERE id = $3;`,
        [user.id, user.name, da.order_id]
      )

      await query("UPDATE order_timeline SET current = false WHERE order_id = $1;", [da.order_id])
      await query(
        `INSERT INTO order_timeline (order_id, label, description, completed, current)
         VALUES ($1, 'Out for Delivery', 'Rider is on the way to delivery address', true, true);`,
        [da.order_id]
      )
    }

    res.json({ success: true, status })
  } catch (error: any) {
    console.error("Update delivery status error:", error)
    res.status(500).json({ error: "Failed to update status" })
  }
})

// Submit Proof of Delivery (Canvas signature upload to Supabase storage)
riderRouter.post(
  "/deliveries/:id/proof-of-delivery",
  authenticateToken,
  requireRole("admin", "rider"),
  async (req: Request, res: Response) => {
    const client = await getClient()
    try {
      const { id } = req.params
      const { recipientName, signatureBase64, deliveryNotes } = req.body
      const user = req.user!

      if (!recipientName || !signatureBase64) {
        res.status(400).json({ error: "Recipient name and customer signature are required" })
        return
      }

      await client.query("BEGIN")

      const daRes = await client.query(
        "SELECT id, order_id, delivery_fee FROM delivery_assignments WHERE id = $1 OR order_id = $1 FOR UPDATE;",
        [id]
      )
      if (daRes.rows.length === 0) {
        res.status(404).json({ error: "Delivery assignment not found" })
        return
      }

      const da = daRes.rows[0]
      const orderId = da.order_id

      // Upload signature to Supabase Storage
      const signatureUrl = await uploadToStorage(
        "proof-of-delivery",
        `sig-${orderId}.png`,
        signatureBase64,
        "image/png"
      )

      // Insert proof of delivery record
      await client.query(
        `INSERT INTO proof_of_delivery (order_id, rider_id, recipient_name, signature_url, delivery_notes)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (order_id) DO UPDATE SET
           recipient_name = EXCLUDED.recipient_name,
           signature_url = EXCLUDED.signature_url,
           delivery_notes = EXCLUDED.delivery_notes,
           delivered_at = NOW();`,
        [orderId, user.id, recipientName.trim(), signatureUrl, deliveryNotes || null]
      )

      // Mark delivery assignment DELIVERED
      await client.query(
        `UPDATE delivery_assignments
         SET status = 'DELIVERED', delivered_at = NOW(), rider_id = $1
         WHERE id = $2;`,
        [user.id, da.id]
      )

      // Mark order DELIVERED
      const ordRes = await client.query(
        `UPDATE orders
         SET status = 'DELIVERED',
             updated_at = NOW()
         WHERE id = $1
         RETURNING order_number, customer_name, customer_email, total;`,
        [orderId]
      )
      const order = ordRes.rows[0]

      // Update rider stats
      await client.query(
        `UPDATE rider_profiles
         SET deliveries_completed = deliveries_completed + 1,
             today_earnings = today_earnings + $1,
             week_earnings = week_earnings + $1
         WHERE user_id = $2;`,
        [da.delivery_fee || 1500, user.id]
      )

      // Append Delivered to order timeline
      await client.query("UPDATE order_timeline SET current = false WHERE order_id = $1;", [orderId])
      await client.query(
        `INSERT INTO order_timeline (order_id, label, description, completed, current)
         VALUES ($1, 'Delivered', $2, true, true);`,
        [orderId, `Received by ${recipientName.trim()}`]
      )

      await client.query("COMMIT")

      // Send delivery email
      if (order?.customer_email) {
        sendOrderDeliveredEmail(order.customer_email, order.customer_name, order.order_number).catch((e) =>
          console.warn("Delivery email error:", e.message)
        )
      }

      res.json({
        success: true,
        signatureUrl,
        deliveredAt: new Date().toISOString(),
        message: "Proof of delivery submitted successfully",
      })
    } catch (error: any) {
      await client.query("ROLLBACK")
      console.error("Proof of delivery error:", error)
      res.status(500).json({ error: error.message || "Failed to submit proof of delivery" })
    } finally {
      client.release()
    }
  }
)
