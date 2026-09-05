import { Router, Request, Response } from "express"
import { query, getClient } from "../db"
import { authenticateToken } from "../auth"

export const reviewRouter = Router()

// List reviews for a product
reviewRouter.get("/product/:productId", async (req: Request, res: Response) => {
  try {
    const { productId } = req.params
    const result = await query(
      `SELECT id, product_id as "productId", customer_name as "customerName",
              rating, title, comment, created_at as "date",
              verified_purchase as "verifiedPurchase", helpful_count as "helpfulCount"
       FROM reviews
       WHERE product_id = $1 AND status = 'APPROVED'
       ORDER BY created_at DESC;`,
      [productId]
    )
    res.json(result.rows)
  } catch (error: any) {
    console.error("Fetch reviews error:", error)
    res.status(500).json({ error: "Failed to fetch reviews" })
  }
})

// Submit a product review
reviewRouter.post("/", authenticateToken, async (req: Request, res: Response) => {
  const client = await getClient()
  try {
    const { productId, rating, title, comment } = req.body
    const user = req.user!

    const ratingNum = parseInt(rating, 10)
    if (!productId || isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5 || !title || !comment) {
      res.status(400).json({ error: "Valid productId, rating (1-5), title, and comment are required" })
      return
    }

    await client.query("BEGIN")

    // Check if user previously purchased this product
    const purchaseCheck = await client.query(
      `SELECT oi.id
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE oi.product_id = $1 AND o.customer_id = $2 AND o.status = 'DELIVERED';`,
      [productId, user.id]
    )
    const isVerified = purchaseCheck.rows.length > 0

    // Insert review
    const insertRes = await client.query(
      `INSERT INTO reviews (product_id, user_id, customer_name, rating, title, comment, verified_purchase, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'APPROVED')
       RETURNING id, product_id as "productId", customer_name as "customerName", rating, title, comment, created_at as "date", verified_purchase as "verifiedPurchase", helpful_count as "helpfulCount";`,
      [productId, user.id, user.name, ratingNum, title.trim(), comment.trim(), isVerified]
    )

    // Recalculate and update product rating and review count
    const statsRes = await client.query(
      `SELECT COUNT(*)::int as count, AVG(rating)::numeric(3, 2) as avg
       FROM reviews
       WHERE product_id = $1 AND status = 'APPROVED';`,
      [productId]
    )

    const count = statsRes.rows[0].count
    const avg = statsRes.rows[0].avg || 5.0

    await client.query(
      `UPDATE products
       SET rating = $1, review_count = $2, updated_at = NOW()
       WHERE id = $3;`,
      [avg, count, productId]
    )

    await client.query("COMMIT")

    res.status(201).json(insertRes.rows[0])
  } catch (error: any) {
    await client.query("ROLLBACK")
    console.error("Submit review error:", error)
    res.status(500).json({ error: "Failed to submit review" })
  } finally {
    client.release()
  }
})
