import { Router, Request, Response } from "express"
import { query } from "../db"
import { authenticateToken } from "../auth"

export const addressRouter = Router()

// List customer's addresses
addressRouter.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const result = await query(
      `SELECT id, label, full_name as "fullName", phone, line1, line2, city, state, is_default as "isDefault", created_at as "createdAt"
       FROM addresses
       WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC;`,
      [userId]
    )
    res.json(result.rows)
  } catch (error: any) {
    console.error("Fetch addresses error:", error)
    res.status(500).json({ error: "Failed to fetch addresses" })
  }
})

// Create new address
addressRouter.post("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const { label, fullName, phone, line1, line2, city, state, isDefault } = req.body

    if (!fullName || !phone || !line1) {
      res.status(400).json({ error: "Full name, phone, and address line 1 are required" })
      return
    }

    // If setting default, unset existing defaults
    if (isDefault) {
      await query("UPDATE addresses SET is_default = false WHERE user_id = $1;", [userId])
    } else {
      // If this is the user's first address, make it default automatically
      const countRes = await query("SELECT COUNT(*) FROM addresses WHERE user_id = $1;", [userId])
      if (parseInt(countRes.rows[0].count, 10) === 0) {
        req.body.isDefault = true
      }
    }

    const insertRes = await query(
      `INSERT INTO addresses (user_id, label, full_name, phone, line1, line2, city, state, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, label, full_name as "fullName", phone, line1, line2, city, state, is_default as "isDefault";`,
      [
        userId,
        label || "Home",
        fullName.trim(),
        phone.trim(),
        line1.trim(),
        line2 ? line2.trim() : null,
        city || "Lagos",
        state || "Lagos State",
        req.body.isDefault || false,
      ]
    )

    res.status(201).json(insertRes.rows[0])
  } catch (error: any) {
    console.error("Create address error:", error)
    res.status(500).json({ error: "Failed to create address" })
  }
})

// Update address
addressRouter.put("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const { id } = req.params
    const { label, fullName, phone, line1, line2, city, state, isDefault } = req.body

    if (isDefault) {
      await query("UPDATE addresses SET is_default = false WHERE user_id = $1;", [userId])
    }

    const updateRes = await query(
      `UPDATE addresses
       SET label = COALESCE($1, label),
           full_name = COALESCE($2, full_name),
           phone = COALESCE($3, phone),
           line1 = COALESCE($4, line1),
           line2 = COALESCE($5, line2),
           city = COALESCE($6, city),
           state = COALESCE($7, state),
           is_default = COALESCE($8, is_default)
       WHERE id = $9 AND user_id = $10
       RETURNING id, label, full_name as "fullName", phone, line1, line2, city, state, is_default as "isDefault";`,
      [label, fullName, phone, line1, line2, city, state, isDefault, id, userId]
    )

    if (updateRes.rows.length === 0) {
      res.status(404).json({ error: "Address not found or unauthorized" })
      return
    }

    res.json(updateRes.rows[0])
  } catch (error: any) {
    console.error("Update address error:", error)
    res.status(500).json({ error: "Failed to update address" })
  }
})

// Set address as default
addressRouter.post("/:id/default", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const { id } = req.params

    await query("UPDATE addresses SET is_default = false WHERE user_id = $1;", [userId])
    const resUpdate = await query(
      "UPDATE addresses SET is_default = true WHERE id = $1 AND user_id = $2 RETURNING id;",
      [id, userId]
    )

    if (resUpdate.rows.length === 0) {
      res.status(404).json({ error: "Address not found or unauthorized" })
      return
    }

    res.json({ success: true, message: "Default address updated" })
  } catch (error: any) {
    console.error("Set default address error:", error)
    res.status(500).json({ error: "Failed to set default address" })
  }
})

// Delete address
addressRouter.delete("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const { id } = req.params

    const delRes = await query("DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING is_default;", [
      id,
      userId,
    ])

    if (delRes.rows.length === 0) {
      res.status(404).json({ error: "Address not found or unauthorized" })
      return
    }

    // If deleted address was default, make another address default if available
    if (delRes.rows[0].is_default) {
      await query(
        `UPDATE addresses
         SET is_default = true
         WHERE id = (SELECT id FROM addresses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1);`,
        [userId]
      )
    }

    res.json({ success: true, message: "Address deleted" })
  } catch (error: any) {
    console.error("Delete address error:", error)
    res.status(500).json({ error: "Failed to delete address" })
  }
})
