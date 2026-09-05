import { Router, Request, Response } from "express"
import { query } from "../db"
import { authenticateToken } from "../auth"

export const cartRouter = Router()

// Get customer's cart with authoritative DB prices and current stock
cartRouter.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const cartRes = await query(
      `SELECT ci.product_id as "productId", ci.quantity,
              p.name, p.brand, p.unit, p.price::float, p.compare_at_price::float as "compareAtPrice",
              p.image_url as "imageUrl", p.stock, p.stock_status as "stockStatus", p.slug
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1 AND p.status = 'ACTIVE'
       ORDER BY ci.created_at ASC;`,
      [userId]
    )

    const items = cartRes.rows
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)

    res.json({
      items,
      subtotal,
      totalItems,
    })
  } catch (error: any) {
    console.error("Fetch cart error:", error)
    res.status(500).json({ error: "Failed to fetch cart" })
  }
})

// Add or update cart item
cartRouter.post("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const { productId, quantity } = req.body

    if (!productId || typeof quantity !== "number" || quantity <= 0) {
      res.status(400).json({ error: "Valid productId and positive quantity are required" })
      return
    }

    // Authoritative stock verification
    const productRes = await query(
      "SELECT id, name, price, stock, stock_status FROM products WHERE id = $1 AND status = 'ACTIVE';",
      [productId]
    )

    if (productRes.rows.length === 0) {
      res.status(404).json({ error: "Product not found or unavailable" })
      return
    }

    const product = productRes.rows[0]
    if (product.stock < quantity) {
      res.status(400).json({
        error: `Only ${product.stock} units of ${product.name} are available in stock.`,
        availableStock: product.stock,
      })
      return
    }

    // Upsert into cart_items
    await query(
      `INSERT INTO cart_items (user_id, product_id, quantity, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, product_id) DO UPDATE SET
         quantity = EXCLUDED.quantity,
         updated_at = NOW();`,
      [userId, productId, quantity]
    )

    res.json({ success: true, message: "Cart updated" })
  } catch (error: any) {
    console.error("Update cart error:", error)
    res.status(500).json({ error: "Failed to update cart" })
  }
})

// Remove single product from cart
cartRouter.delete("/:productId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const { productId } = req.params

    await query("DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2", [userId, productId])
    res.json({ success: true, message: "Item removed from cart" })
  } catch (error: any) {
    console.error("Remove cart item error:", error)
    res.status(500).json({ error: "Failed to remove item from cart" })
  }
})

// Clear entire cart
cartRouter.delete("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    await query("DELETE FROM cart_items WHERE user_id = $1", [userId])
    res.json({ success: true, message: "Cart cleared" })
  } catch (error: any) {
    console.error("Clear cart error:", error)
    res.status(500).json({ error: "Failed to clear cart" })
  }
})

// Merge guest cart items into user's DB cart after signing in
cartRouter.post("/merge", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const { items } = req.body // [{ productId, quantity }]

    if (!Array.isArray(items) || items.length === 0) {
      res.json({ success: true, message: "No items to merge" })
      return
    }

    for (const item of items) {
      if (item.productId && item.quantity > 0) {
        // Check stock
        const p = await query("SELECT stock FROM products WHERE id = $1", [item.productId])
        if (p.rows.length > 0) {
          const clampedQty = Math.min(item.quantity, p.rows[0].stock)
          if (clampedQty > 0) {
            await query(
              `INSERT INTO cart_items (user_id, product_id, quantity, updated_at)
               VALUES ($1, $2, $3, NOW())
               ON CONFLICT (user_id, product_id) DO UPDATE SET
                 quantity = GREATEST(cart_items.quantity, EXCLUDED.quantity),
                 updated_at = NOW();`,
              [userId, item.productId, clampedQty]
            )
          }
        }
      }
    }

    res.json({ success: true, message: "Guest cart merged into account" })
  } catch (error: any) {
    console.error("Merge cart error:", error)
    res.status(500).json({ error: "Failed to merge cart" })
  }
})
