import { Router, Request, Response } from "express"
import { query } from "../db"
import { authenticateToken, requireRole } from "../auth"

export const couponRouter = Router()

// Validate coupon and authoritatively calculate discount
couponRouter.post("/validate", async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body
    if (!code) {
      res.status(400).json({ valid: false, error: "Coupon code is required" })
      return
    }

    const cleanCode = code.toUpperCase().trim()
    const couponRes = await query(
      `SELECT id, code, discount_type as "discountType", discount_value::float as "discountValue",
              min_order::float as "minOrder", max_discount::float as "maxDiscount",
              expires_at as "expiresAt", usage_limit as "usageLimit", used_count as "usedCount", status
       FROM coupons
       WHERE code = $1;`,
      [cleanCode]
    )

    if (couponRes.rows.length === 0) {
      res.status(404).json({ valid: false, error: "Invalid coupon code" })
      return
    }

    const c = couponRes.rows[0]

    if (c.status !== "ACTIVE") {
      res.status(400).json({ valid: false, error: "This coupon is no longer active" })
      return
    }

    if (c.expiresAt && new Date(c.expiresAt) < new Date()) {
      res.status(400).json({ valid: false, error: "This coupon has expired" })
      return
    }

    if (c.usageLimit > 0 && c.usedCount >= c.usageLimit) {
      res.status(400).json({ valid: false, error: "This coupon has reached its maximum usage limit" })
      return
    }

    const orderSubtotal = parseFloat(subtotal || 0)
    if (orderSubtotal < c.minOrder) {
      res.status(400).json({
        valid: false,
        error: `Minimum order of ₦${c.minOrder.toLocaleString()} required to use this coupon.`,
      })
      return
    }

    let discount = 0
    if (c.discountType === "PERCENTAGE") {
      discount = Math.round((orderSubtotal * c.discountValue) / 100)
      if (c.maxDiscount && discount > c.maxDiscount) {
        discount = c.maxDiscount
      }
    } else {
      discount = c.discountValue
    }

    // Discount cannot exceed subtotal
    discount = Math.min(discount, orderSubtotal)

    res.json({
      valid: true,
      code: c.code,
      discount,
      discountType: c.discountType,
      discountValue: c.discountValue,
      message: `Coupon ${c.code} applied: save ₦${discount.toLocaleString()}`,
    })
  } catch (error: any) {
    console.error("Validate coupon error:", error)
    res.status(500).json({ valid: false, error: "Failed to validate coupon" })
  }
})

// List coupons (Admin)
couponRouter.get("/", authenticateToken, requireRole("admin"), async (_req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT id, code, discount_type as "discountType", discount_value::float as "discountValue",
              min_order::float as "minOrder", max_discount::float as "maxDiscount",
              expires_at as "expiresAt", usage_limit as "usageLimit", used_count as "usedCount",
              status, created_at as "createdAt"
       FROM coupons
       ORDER BY created_at DESC;`
    )
    res.json(result.rows)
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch coupons" })
  }
})

// Create coupon (Admin)
couponRouter.post("/", authenticateToken, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { code, discountType, discountValue, minOrder = 0, maxDiscount, expiresAt, usageLimit = 1000 } = req.body

    if (!code || !discountType || !discountValue) {
      res.status(400).json({ error: "Code, discountType, and discountValue are required" })
      return
    }

    const cleanCode = code.toUpperCase().trim()
    const id = `cpn-${Date.now().toString().slice(-6)}`

    const insertRes = await query(
      `INSERT INTO coupons (id, code, discount_type, discount_value, min_order, max_discount, expires_at, usage_limit, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE')
       RETURNING id, code, discount_type as "discountType", discount_value::float as "discountValue",
                 min_order::float as "minOrder", status;`,
      [id, cleanCode, discountType, discountValue, minOrder, maxDiscount || null, expiresAt || null, usageLimit]
    )

    res.status(201).json(insertRes.rows[0])
  } catch (error: any) {
    console.error("Create coupon error:", error)
    res.status(500).json({ error: "Failed to create coupon" })
  }
})
