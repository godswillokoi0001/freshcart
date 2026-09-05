import { Router, Request, Response } from "express"
import { query } from "../db"
import { authenticateToken, optionalToken, resolveAuthUser } from "../auth"

export const authRouter = Router()

// Register: creates a user profile in the database.
// Note: Actual account creation should be done via Supabase JS client (signUp).
// This endpoint ensures the database profile exists for the given email.
authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    console.log('=== REGISTER CALLED ===');
    console.log('Body:', req.body);
    const { name, email, phone } = req.body

    if (!email) {
      res.status(400).json({ error: "Email is required" })
      return
    }

    const cleanEmail = email.toLowerCase().trim()
    console.log('Clean email:', cleanEmail);

    // Check if user profile already exists
    const existing = await query("SELECT id FROM profiles WHERE email = $1", [cleanEmail])
    console.log('Existing rows:', existing.rows.length);
    if (existing.rows.length > 0) {
      res.status(400).json({ error: "An account with this email already exists" })
      return
    }

    console.log('About to insert profile...');
    // Note: The actual Supabase Auth user should be created via the frontend
    // Supabase JS client: supabase.auth.signUp({ email, password, ... })
    // This server endpoint creates the corresponding database profile.
    // The Supabase trigger on_auth_user_created_after will sync auth.users ⇄ profiles.
    const insertRes = await query(
      `INSERT INTO profiles (id, email, full_name, phone, role, status)
       VALUES (gen_random_uuid(), $1, $2, $3, 'customer', 'ACTIVE')
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, full_name, phone, role, status;`,
      [cleanEmail, name || null, phone || null]
    );
    console.log('Insert result rows:', insertRes.rows.length);
    console.log('Insert result:', insertRes.rows);

    const newUser = insertRes.rows[0]

    if (!newUser) {
      res.status(400).json({ error: "Failed to create user profile. Please sign up via the Supabase JS client." })
      return
    }

    res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.full_name || newUser.email?.split("@")[0] || "Customer",
        email: newUser.email,
        phone: newUser.phone || "",
        role: newUser.role,
        status: newUser.status,
      },
    })
  } catch (error: any) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Registration failed. Please try again." })
  }
})

// Login: verifies a Supabase Auth token and returns the user profile.
// The supabaseToken should be passed in the request body or as Authorization: Bearer header.
authRouter.post("/login", optionalToken, async (req: Request, res: Response) => {
  try {
    // If a supabaseToken is provided in the body, use it; otherwise req.user from optionalToken
    let token = req.body?.supabaseToken || req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.substring(7) : null

    if (!token) {
      res.status(400).json({ error: "Supabase token is required" })
      return
    }

    const user = await resolveAuthUser(token)
    if (!user) {
      res.status(401).json({ error: "Invalid or expired authentication session" })
      return
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.email ? "" : "", // phone not always available from Supabase metadata
        role: user.role,
        status: user.status,
      },
    })
  } catch (error: any) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Login failed. Please try again." })
  }
})

// Current user verification
authRouter.get("/me", authenticateToken, async (req: Request, res: Response) => {
  try {
    res.json({
      user: {
        id: req.user!.id,
        name: req.user!.name,
        email: req.user!.email,
        phone: req.user!.phone || "",
        role: req.user!.role,
        status: req.user!.status,
      },
    })
  } catch (error: any) {
    console.error("Me error:", error)
    res.status(500).json({ error: "Failed to retrieve user session" })
  }
})

// Password reset - always responds success to prevent account enumeration
authRouter.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body
    if (!email) {
      res.status(400).json({ error: "Email is required" })
      return
    }
    res.json({ message: "If an account exists with this email, password reset instructions have been sent." })
  } catch (error: any) {
    res.status(500).json({ error: "Password reset request failed" })
  }
})

// Login as Role (One-click role switching for development/testing)
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
    console.error("Login as role error:", error)
    res.status(500).json({ error: "Failed to authenticate as role" })
  }
})