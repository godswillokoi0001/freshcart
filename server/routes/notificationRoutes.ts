import { Router, Request, Response } from "express"
import { query } from "../db"
import { authenticateToken } from "../auth"

export const notificationRouter = Router()

// List notifications for logged in user
notificationRouter.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const result = await query(
      `SELECT id, title, message, type, read, link, created_at as "createdAt"
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50;`,
      [userId]
    )

    const unreadCount = result.rows.filter((n) => !n.read).length
    res.json({
      notifications: result.rows,
      unreadCount,
    })
  } catch (error: any) {
    console.error("Fetch notifications error:", error)
    res.status(500).json({ error: "Failed to fetch notifications" })
  }
})

// Mark single notification as read
notificationRouter.patch("/:id/read", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const { id } = req.params

    await query("UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2;", [id, userId])
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: "Failed to mark notification as read" })
  }
})

// Mark all notifications as read
notificationRouter.post("/read-all", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    await query("UPDATE notifications SET read = true WHERE user_id = $1;", [userId])
    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: "Failed to mark all notifications as read" })
  }
})
