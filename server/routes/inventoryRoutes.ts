import { Router, Request, Response } from "express"
import { query, getClient } from "../db"
import { authenticateToken, requireRole } from "../auth"

export const inventoryRouter = Router()

// Get full inventory status with low-stock alerts
inventoryRouter.get("/", authenticateToken, requireRole("admin", "staff"), async (_req: Request, res: Response) => {
  try {
    const productsRes = await query(
      `SELECT p.id, p.name, p.sku, p.category_name as "categoryName", p.unit, p.price::float,
              p.stock, p.stock_status as "stockStatus", p.low_stock_threshold as "lowStockThreshold",
              p.image_url as "imageUrl", p.updated_at as "updatedAt"
       FROM products p
       WHERE p.status = 'ACTIVE'
       ORDER BY p.stock ASC, p.name ASC;`
    )

    const transactionsRes = await query(
      `SELECT it.id, it.product_id as "productId", p.name as "productName",
              it.type, it.quantity, it.previous_stock as "previousStock",
              it.new_stock as "newStock", it.reference_id as "referenceId",
              it.notes, it.created_at as "createdAt"
       FROM inventory_transactions it
       JOIN products p ON p.id = it.product_id
       ORDER BY it.created_at DESC
       LIMIT 50;`
    )

    const lowStockCount = productsRes.rows.filter(
      (p) => p.stock <= p.lowStockThreshold || p.stockStatus === "OUT_OF_STOCK"
    ).length

    res.json({
      items: productsRes.rows,
      transactions: transactionsRes.rows,
      lowStockCount,
      totalItems: productsRes.rows.length,
    })
  } catch (error: any) {
    console.error("Inventory error:", error)
    res.status(500).json({ error: "Failed to fetch inventory" })
  }
})

// Adjust inventory atomically (Admin or Staff)
inventoryRouter.post("/adjust", authenticateToken, requireRole("admin", "staff"), async (req: Request, res: Response) => {
  const client = await getClient()
  try {
    const { productId, adjustment, type = "MANUAL_ADJUSTMENT", notes } = req.body
    const adjNum = parseInt(adjustment, 10)

    if (!productId || isNaN(adjNum) || adjNum === 0) {
      res.status(400).json({ error: "Valid productId and non-zero adjustment are required" })
      return
    }

    await client.query("BEGIN")

    const pRes = await client.query(
      "SELECT id, name, stock FROM products WHERE id = $1 FOR UPDATE;",
      [productId]
    )

    if (pRes.rows.length === 0) {
      res.status(404).json({ error: "Product not found" })
      return
    }

    const currentStock = pRes.rows[0].stock
    const newStock = Math.max(0, currentStock + adjNum)
    const newStatus = newStock === 0 ? "OUT_OF_STOCK" : newStock <= 5 ? "LOW_STOCK" : "IN_STOCK"

    await client.query(
      `UPDATE products SET stock = $1, stock_status = $2, updated_at = NOW() WHERE id = $3;`,
      [newStock, newStatus, productId]
    )

    await client.query(
      `INSERT INTO inventory_transactions (product_id, type, quantity, previous_stock, new_stock, notes)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [productId, type, adjNum, currentStock, newStock, notes || `Adjusted by ${req.user!.name}`]
    )

    await client.query("COMMIT")

    res.json({
      success: true,
      productId,
      previousStock: currentStock,
      newStock,
      stockStatus: newStatus,
    })
  } catch (error: any) {
    await client.query("ROLLBACK")
    console.error("Adjust inventory error:", error)
    res.status(500).json({ error: "Failed to adjust inventory" })
  } finally {
    client.release()
  }
})
