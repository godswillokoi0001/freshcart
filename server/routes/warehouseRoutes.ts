import { Router, Request, Response } from "express"
import { query } from "../db"
import { authenticateToken, requireRole } from "../auth"

export const warehouseRouter = Router()

// Get warehouse packing & fulfillment queue
warehouseRouter.get("/queue", authenticateToken, requireRole("admin", "staff"), async (_req: Request, res: Response) => {
  try {
    const ordersRes = await query(
      `SELECT o.id, o.order_number as "orderNumber", o.customer_name as "customerName",
              o.customer_phone as "customerPhone", o.delivery_slot as "deliverySlot",
              o.delivery_notes as "deliveryNotes", o.status, o.created_at as "createdAt",
              o.total::float
       FROM orders o
       WHERE o.status IN ('CONFIRMED', 'PREPARING', 'PACKED', 'READY_FOR_PICKUP')
       ORDER BY o.created_at ASC;`
    )

    const orders = ordersRes.rows
    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.id)
      const itemsRes = await query(
        `SELECT order_id as "orderId", product_id as "productId", name, brand, unit,
                price::float, quantity, image_url as "imageUrl",
                picked_status as "pickedStatus", substitution_note as "substitutionNote"
         FROM order_items
         WHERE order_id = ANY($1);`,
        [orderIds]
      )

      const itemsMap: Record<string, any[]> = {}
      for (const item of itemsRes.rows) {
        if (!itemsMap[item.orderId]) itemsMap[item.orderId] = []
        itemsMap[item.orderId].push(item)
      }

      for (const o of orders) {
        o.items = itemsMap[o.id] || []
      }
    }

    res.json(orders)
  } catch (error: any) {
    console.error("Warehouse queue error:", error)
    res.status(500).json({ error: "Failed to fetch warehouse queue" })
  }
})

// Mark order as Being Prepared
warehouseRouter.post("/orders/:id/start-prep", authenticateToken, requireRole("admin", "staff"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    await query("UPDATE orders SET status = 'PREPARING', updated_at = NOW() WHERE id = $1;", [id])
    await query("UPDATE order_timeline SET current = false WHERE order_id = $1;", [id])
    await query(
      `INSERT INTO order_timeline (order_id, label, description, completed, current)
       VALUES ($1, 'Being Prepared', 'Fulfillment staff started picking groceries', true, true);`,
      [id]
    )

    res.json({ success: true, message: "Order marked as PREPARING" })
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update order to PREPARING" })
  }
})

// Complete packing for order items
warehouseRouter.post("/orders/:id/pack", authenticateToken, requireRole("admin", "staff"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { items } = req.body // [{ productId, pickedStatus, substitutionNote }]

    if (Array.isArray(items)) {
      for (const itm of items) {
        await query(
          `UPDATE order_items
           SET picked_status = COALESCE($1, picked_status),
               substitution_note = COALESCE($2, substitution_note)
           WHERE order_id = $3 AND product_id = $4;`,
          [itm.pickedStatus, itm.substitutionNote, id, itm.productId]
        )
      }
    }

    await query("UPDATE orders SET status = 'PACKED', updated_at = NOW() WHERE id = $1;", [id])
    await query("UPDATE order_timeline SET current = false WHERE order_id = $1;", [id])
    await query(
      `INSERT INTO order_timeline (order_id, label, description, completed, current)
       VALUES ($1, 'Packing Completed', 'All groceries picked, verified, and safely packed', true, true);`,
      [id]
    )

    // Increment staff member's fulfilled count
    if (req.user) {
      await query("UPDATE staff_profiles SET orders_fulfilled = orders_fulfilled + 1 WHERE user_id = $1;", [
        req.user.id,
      ])
    }

    res.json({ success: true, message: "Order packed successfully" })
  } catch (error: any) {
    console.error("Pack order error:", error)
    res.status(500).json({ error: "Failed to pack order" })
  }
})

// Mark ready for pickup / rider dispatch
warehouseRouter.post("/orders/:id/ready-dispatch", authenticateToken, requireRole("admin", "staff"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    await query("UPDATE orders SET status = 'READY_FOR_PICKUP', updated_at = NOW() WHERE id = $1;", [id])
    await query("UPDATE order_timeline SET current = false WHERE order_id = $1;", [id])
    await query(
      `INSERT INTO order_timeline (order_id, label, description, completed, current)
       VALUES ($1, 'Ready for Dispatch', 'Awaiting rider pickup at supermarket hub', true, true);`,
      [id]
    )

    res.json({ success: true, message: "Order marked READY_FOR_PICKUP" })
  } catch (error: any) {
    res.status(500).json({ error: "Failed to mark order ready for dispatch" })
  }
})
