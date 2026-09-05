import express from "express"
import path from "path"
import { createServer as createViteServer } from "vite"
import { runMigrations } from "./server/migrations/migrate"
import { authRouter } from "./server/routes/authRoutes"
import { productRouter } from "./server/routes/productRoutes"
import { categoryRouter } from "./server/routes/categoryRoutes"
import { brandRouter } from "./server/routes/brandRoutes"
import { cartRouter } from "./server/routes/cartRoutes"
import { wishlistRouter } from "./server/routes/wishlistRoutes"
import { addressRouter } from "./server/routes/addressRoutes"
import { couponRouter } from "./server/routes/couponRoutes"
import { orderRouter } from "./server/routes/orderRoutes"
import { paymentRouter } from "./server/routes/paymentRoutes"
import { inventoryRouter } from "./server/routes/inventoryRoutes"
import { warehouseRouter } from "./server/routes/warehouseRoutes"
import { riderRouter } from "./server/routes/riderRoutes"
import { reviewRouter } from "./server/routes/reviewRoutes"
import { notificationRouter } from "./server/routes/notificationRoutes"
import { adminRouter } from "./server/routes/adminRoutes"

const PORT = 3000

async function startServer() {
  const app = express()

  // Run database migrations & seeding on startup
  try {
    await runMigrations()
  } catch (err) {
    console.error("Migration error during startup:", err)
  }

  // Body parser middlewares (with ample limits for base64 signature/product images)
  app.use(express.json({ limit: "25mb" }))
  app.use(express.urlencoded({ extended: true, limit: "25mb" }))

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "FreshCart Backend API",
    })
  })

  // API Routes
  app.use("/api/auth", authRouter)
  app.use("/api/products", productRouter)
  app.use("/api/categories", categoryRouter)
  app.use("/api/brands", brandRouter)
  app.use("/api/cart", cartRouter)
  app.use("/api/wishlist", wishlistRouter)
  app.use("/api/addresses", addressRouter)
  app.use("/api/coupons", couponRouter)
  app.use("/api/orders", orderRouter)
  app.use("/api/payments", paymentRouter)
  app.use("/api/inventory", inventoryRouter)
  app.use("/api/warehouse", warehouseRouter)
  app.use("/api/rider", riderRouter)
  app.use("/api/reviews", reviewRouter)
  app.use("/api/notifications", notificationRouter)
  app.use("/api/admin", adminRouter)

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    })
    app.use(vite.middlewares)
  } else {
    const distPath = path.join(process.cwd(), "dist")
    app.use(express.static(distPath))
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"))
    })
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🛒 FreshCart Production Server running on http://0.0.0.0:${PORT}`)
  })
}

startServer()
