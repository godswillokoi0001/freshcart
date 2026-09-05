import { Router, Request, Response } from "express"
import { query } from "../db"
import { authenticateToken, requireRole } from "../auth"

export const categoryRouter = Router()

// List all categories with dynamic live product counts
categoryRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT c.id, c.name, c.slug, c.description, c.image_url as "imageUrl", c.status, c.sort_order,
              COUNT(p.id)::int as "productCount"
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.status = 'ACTIVE'
       GROUP BY c.id
       ORDER BY c.sort_order ASC, c.name ASC;`
    )
    res.json(result.rows)
  } catch (error: any) {
    console.error("Fetch categories error:", error)
    res.status(500).json({ error: "Failed to fetch categories" })
  }
})

// Create category (Admin)
categoryRouter.post("/", authenticateToken, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { name, description, imageUrl, status } = req.body
    if (!name) {
      res.status(400).json({ error: "Category name is required" })
      return
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    const id = slug

    const insertRes = await query(
      `INSERT INTO categories (id, name, slug, description, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, slug, description, image_url as "imageUrl", status, 0 as "productCount";`,
      [id, name, slug, description || "", imageUrl || "", status || "ACTIVE"]
    )

    res.status(201).json(insertRes.rows[0])
  } catch (error: any) {
    console.error("Create category error:", error)
    res.status(500).json({ error: "Failed to create category" })
  }
})

// Update category (Admin)
categoryRouter.put("/:id", authenticateToken, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, description, imageUrl, status } = req.body

    const updateRes = await query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           image_url = COALESCE($3, image_url),
           status = COALESCE($4, status),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, slug, description, image_url as "imageUrl", status;`,
      [name, description, imageUrl, status, id]
    )

    if (updateRes.rows.length === 0) {
      res.status(404).json({ error: "Category not found" })
      return
    }

    res.json(updateRes.rows[0])
  } catch (error: any) {
    console.error("Update category error:", error)
    res.status(500).json({ error: "Failed to update category" })
  }
})

// Delete category (Admin)
categoryRouter.delete("/:id", authenticateToken, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await query("DELETE FROM categories WHERE id = $1", [id])
    res.json({ message: "Category deleted successfully" })
  } catch (error: any) {
    console.error("Delete category error:", error)
    res.status(500).json({ error: "Failed to delete category" })
  }
})
