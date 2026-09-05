import { Router, Request, Response } from "express"
import { query } from "../db"
import { authenticateToken } from "../auth"

export const wishlistRouter = Router()

// Get customer's wishlist items
wishlistRouter.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const result = await query(
      `SELECT wi.product_id as "productId", wi.created_at as "addedAt",
              p.name, p.slug, p.brand, p.unit, p.price::float, p.compare_at_price::float as "compareAtPrice",
              p.image_url as "imageUrl", p.stock, p.stock_status as "stockStatus", p.rating::float
       FROM wishlist_items wi
       JOIN products p ON p.id = wi.product_id
       WHERE wi.user_id = $1 AND p.status = 'ACTIVE'
       ORDER BY wi.created_at DESC;`,
      [userId]
    )

    const ids = result.rows.map((r) => r.productId)
    res.json({
      ids,
      items: result.rows,
      count: result.rows.length,
    })
  } catch (error: any) {
    console.error("Fetch wishlist error:", error)
    res.status(500).json({ error: "Failed to fetch wishlist" })
  }
})

// Toggle product in wishlist
wishlistRouter.post("/toggle", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const { productId } = req.body

    if (!productId) {
      res.status(400).json({ error: "productId is required" })
      return
    }

    const existing = await query(
      "SELECT id FROM wishlist_items WHERE user_id = $1 AND product_id = $2;",
      [userId, productId]
    )

    if (existing.rows.length > 0) {
      await query("DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2;", [userId, productId])
      res.json({ inWishlist: false, message: "Removed from wishlist" })
    } else {
      await query("INSERT INTO wishlist_items (user_id, product_id) VALUES ($1, $2);", [userId, productId])
      res.json({ inWishlist: true, message: "Added to wishlist" })
    }
  } catch (error: any) {
    console.error("Toggle wishlist error:", error)
    res.status(500).json({ error: "Failed to update wishlist" })
  }
})

// Remove single product from wishlist
wishlistRouter.delete("/:productId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const { productId } = req.params

    await query("DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2", [userId, productId])
    res.json({ success: true, message: "Removed from wishlist" })
  } catch (error: any) {
    console.error("Remove wishlist item error:", error)
    res.status(500).json({ error: "Failed to remove item from wishlist" })
  }
})
