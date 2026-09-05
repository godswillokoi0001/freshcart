import { Router, Request, Response } from "express"
import { query } from "../db"
import { hashPassword, comparePassword, generateToken, authenticateToken } from "../auth"
import { sendWelcomeEmail } from "../email"

export const authRouter = Router()

// Register customer
authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body

    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required" })
      return
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters long" })
      return
    }

    const cleanEmail = email.toLowerCase().trim()

    // Check if user already exists
    const existing = await query("SELECT id FROM users WHERE email = $1", [cleanEmail])
    if (existing.rows.length > 0) {
      res.status(400).json({ error: "An account with this email already exists" })
      return
    }

    const passwordHash = await hashPassword(password)

    const insertRes = await query(
      `INSERT INTO users (full_name, email, password_hash, phone, role, status)
       VALUES ($1, $2, $3, $4, 'customer', 'ACTIVE')
       RETURNING id, full_name, email, phone, role, status, created_at;`,
      [name.trim(), cleanEmail, passwordHash, phone ? phone.trim() : null]
    )

    const newUser = insertRes.rows[0]
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.full_name,
      role: newUser.role,
    })

    // Send welcome email asynchronously
    sendWelcomeEmail(newUser.email, newUser.full_name).catch((e) =>
      console.warn("Welcome email error:", e.message)
    )

    res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone || "",
        role: newUser.role,
        status: newUser.status,
        ordersCount: 0,
        totalSpent: 0,
        joinedAt: newUser.created_at,
      },
      token,
    })
  } catch (error: any) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Registration failed. Please try again." })
  }
})

// Login
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" })
      return
    }

    const cleanEmail = email.toLowerCase().trim()
    const userRes = await query(
      `SELECT u.id, u.email, u.full_name, u.phone, u.password_hash, u.role, u.status, u.created_at,
              sp.staff_role,
              (SELECT COUNT(*) FROM orders WHERE customer_id = u.id) as orders_count,
              COALESCE((SELECT SUM(total) FROM orders WHERE customer_id = u.id AND payment_status = 'PAID'), 0) as total_spent
       FROM users u
       LEFT JOIN staff_profiles sp ON sp.user_id = u.id
       WHERE u.email = $1;`,
      [cleanEmail]
    )

    if (userRes.rows.length === 0) {
      res.status(401).json({ error: "Invalid email or password" })
      return
    }

    const user = userRes.rows[0]

    if (user.status === "SUSPENDED") {
      res.status(403).json({ error: "This account has been suspended. Please contact FreshCart support." })
      return
    }

    const isValid = await comparePassword(password, user.password_hash)
    if (!isValid) {
      res.status(401).json({ error: "Invalid email or password" })
      return
    }

    // Update last_active timestamp for staff/rider
    if (user.role === "staff" || user.role === "admin") {
      await query("UPDATE staff_profiles SET last_active = NOW() WHERE user_id = $1", [user.id])
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.full_name,
      role: user.role,
      staffRole: user.staff_role,
    })

    res.json({
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        status: user.status,
        ordersCount: parseInt(user.orders_count || "0", 10),
        totalSpent: parseFloat(user.total_spent || "0"),
        joinedAt: user.created_at,
      },
      token,
    })
  } catch (error: any) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Login failed. Please try again." })
  }
})

// Current user verification
authRouter.get("/me", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRes = await query(
      `SELECT u.id, u.email, u.full_name, u.phone, u.role, u.status, u.created_at,
              sp.staff_role,
              (SELECT COUNT(*) FROM orders WHERE customer_id = u.id) as orders_count,
              COALESCE((SELECT SUM(total) FROM orders WHERE customer_id = u.id AND payment_status = 'PAID'), 0) as total_spent
       FROM users u
       LEFT JOIN staff_profiles sp ON sp.user_id = u.id
       WHERE u.id = $1;`,
      [req.user!.id]
    )

    if (userRes.rows.length === 0) {
      res.status(404).json({ error: "User not found" })
      return
    }

    const user = userRes.rows[0]
    res.json({
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        status: user.status,
        ordersCount: parseInt(user.orders_count || "0", 10),
        totalSpent: parseFloat(user.total_spent || "0"),
        joinedAt: user.created_at,
      },
    })
  } catch (error: any) {
    console.error("Me error:", error)
    res.status(500).json({ error: "Failed to retrieve user session" })
  }
})

// Password reset
authRouter.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body
    if (!email) {
      res.status(400).json({ error: "Email is required" })
      return
    }

    // Always respond with success to prevent account enumeration
    res.json({ message: "If an account exists with this email, password reset instructions have been sent." })
  } catch (error: any) {
    res.status(500).json({ error: "Password reset request failed" })
  }
})

// Login as Role (One-click role switching with real database accounts)
authRouter.post("/login-as-role", async (req: Request, res: Response) => {
  try {
    const { role } = req.body
    if (!role) {
      res.status(400).json({ error: "Role is required" })
      return
    }

    const normalizedRole = role === "super-admin" ? "admin" : role
    const email = `${normalizedRole}@freshcart.ng`

    const userRes = await query(
      `SELECT u.id, u.email, u.full_name, u.phone, u.role, u.status, u.created_at,
              sp.staff_role,
              (SELECT COUNT(*) FROM orders WHERE customer_id = u.id) as orders_count,
              COALESCE((SELECT SUM(total) FROM orders WHERE customer_id = u.id AND payment_status = 'PAID'), 0) as total_spent
       FROM users u
       LEFT JOIN staff_profiles sp ON sp.user_id = u.id
       WHERE u.email = $1 OR u.role = $2
       ORDER BY u.created_at ASC
       LIMIT 1;`,
      [email, normalizedRole]
    )

    if (userRes.rows.length === 0) {
      res.status(404).json({ error: `No demo account found for role ${role}` })
      return
    }

    const user = userRes.rows[0]
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.full_name,
      role: user.role,
      staffRole: user.staff_role,
    })

    res.json({
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        status: user.status,
        ordersCount: parseInt(user.orders_count || "0", 10),
        totalSpent: parseFloat(user.total_spent || "0"),
        joinedAt: user.created_at,
      },
      token,
    })
  } catch (error: any) {
    console.error("Login as role error:", error)
    res.status(500).json({ error: "Failed to authenticate as role" })
  }
})

