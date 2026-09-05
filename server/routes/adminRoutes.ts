import { Router, Request, Response } from "express"
import { query } from "../db"
import { authenticateToken, requireRole } from "../auth"

export const adminRouter = Router()

// Admin Dashboard KPIs and live aggregated stats
adminRouter.get("/dashboard", authenticateToken, requireRole("admin"), async (_req: Request, res: Response) => {
  try {
    const revRes = await query(
      `SELECT COALESCE(SUM(total), 0)::float as "totalRevenue",
              COUNT(*)::int as "totalOrders"
       FROM orders;`
    )

    const custRes = await query(
      `SELECT COUNT(*)::int as "totalCustomers" FROM users WHERE role = 'customer';`
    )

    const prodRes = await query(
      `SELECT COUNT(*)::int as "totalProducts",
              COUNT(*) FILTER (WHERE stock <= low_stock_threshold OR stock = 0)::int as "lowStockCount"
       FROM products
       WHERE status = 'ACTIVE';`
    )

    // Top selling products based on order_items
    const topProdRes = await query(
      `SELECT p.id, p.name, p.brand, p.unit, p.price::float, p.image_url as "imageUrl",
              COALESCE(SUM(oi.quantity), 0)::int as "totalSold"
       FROM products p
       JOIN order_items oi ON oi.product_id = p.id
       JOIN orders o ON o.id = oi.order_id AND o.status != 'CANCELLED'
       GROUP BY p.id
       ORDER BY "totalSold" DESC
       LIMIT 5;`
    )

    // Recent orders
    const recentOrdersRes = await query(
      `SELECT o.id, o.order_number as "orderNumber", o.customer_name as "customerName",
              o.total::float, o.status, o.payment_status as "paymentStatus",
              o.created_at as "createdAt"
       FROM orders o
       ORDER BY o.created_at DESC
       LIMIT 10;`
    )

    res.json({
      revenue: revRes.rows[0].totalRevenue,
      ordersCount: revRes.rows[0].totalOrders,
      customersCount: custRes.rows[0].totalCustomers,
      productsCount: prodRes.rows[0].totalProducts,
      lowStockCount: prodRes.rows[0].lowStockCount,
      topProducts: topProdRes.rows,
      recentOrders: recentOrdersRes.rows,
    })
  } catch (error: any) {
    console.error("Admin dashboard stats error:", error)
    res.status(500).json({ error: "Failed to fetch admin dashboard statistics" })
  }
})

// Customer directory
adminRouter.get("/customers", authenticateToken, requireRole("admin"), async (_req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT u.id, u.full_name as "name", u.email, u.phone, u.status,
              u.created_at as "joinedAt",
              COUNT(o.id)::int as "ordersCount",
              COALESCE(SUM(o.total) FILTER (WHERE o.payment_status = 'PAID'), 0)::float as "totalSpent",
              MAX(o.created_at) as "lastOrderAt"
       FROM users u
       LEFT JOIN orders o ON o.customer_id = u.id
       WHERE u.role = 'customer'
       GROUP BY u.id
       ORDER BY u.created_at DESC;`
    )

    res.json(result.rows)
  } catch (error: any) {
    console.error("Fetch customers error:", error)
    res.status(500).json({ error: "Failed to fetch customers" })
  }
})

// Staff roster
adminRouter.get("/staff", authenticateToken, requireRole("admin"), async (_req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT u.id, u.full_name as "name", u.email, sp.staff_role as "role",
              u.status, sp.last_active as "lastActive", sp.orders_fulfilled as "ordersFulfilled"
       FROM users u
       JOIN staff_profiles sp ON sp.user_id = u.id
       ORDER BY u.created_at ASC;`
    )
    res.json(result.rows)
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch staff" })
  }
})

// Rider roster
adminRouter.get("/riders", authenticateToken, requireRole("admin"), async (_req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT u.id, u.full_name as "name", u.email, u.phone, rp.vehicle,
              rp.rider_status as "status", u.created_at as "joinedAt",
              rp.deliveries_completed as "deliveriesCompleted", rp.rating::float as "rating",
              rp.today_earnings::float as "todayEarnings", rp.week_earnings::float as "weekEarnings"
       FROM users u
       JOIN rider_profiles rp ON rp.user_id = u.id
       ORDER BY u.created_at ASC;`
    )
    res.json(result.rows)
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch riders" })
  }
})

// Audit logs
adminRouter.get("/audit-logs", authenticateToken, requireRole("admin"), async (_req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT id, user_email as "user", role, action, resource, status, details, created_at as "timestamp"
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT 100;`
    )
    res.json(result.rows)
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch audit logs" })
  }
})
