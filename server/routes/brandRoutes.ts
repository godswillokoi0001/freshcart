import { Router, Request, Response } from "express"
import { query } from "../db"

export const brandRouter = Router()

brandRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT b.id, b.name, b.logo_url as "logoUrl", b.status,
              COUNT(p.id)::int as "productCount"
       FROM brands b
       LEFT JOIN products p ON p.brand = b.name AND p.status = 'ACTIVE'
       GROUP BY b.id
       ORDER BY b.name ASC;`
    )
    res.json(result.rows)
  } catch (error: any) {
    console.error("Fetch brands error:", error)
    res.status(500).json({ error: "Failed to fetch brands" })
  }
})
