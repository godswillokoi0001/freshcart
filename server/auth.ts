import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { supabase } from "./supabase"
import { query } from "./db"

const JWT_SECRET = process.env.AUTH_SECRET || "freshcart_production_jwt_secret_key_2026"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: "customer" | "admin" | "staff" | "rider" | "super-admin"
  staffRole?: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(plainText, salt)
}

export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash)
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      staffRole: user.staffRole,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  )
}

export async function resolveAuthUser(token: string): Promise<AuthUser | null> {
  // 1. Try local server JWT
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    if (decoded && decoded.id) {
      return decoded
    }
  } catch {
    // Not a server JWT, proceed to Supabase token verification
  }

  // 2. Try Supabase Auth token
  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (!error && data?.user) {
      const sbUser = data.user
      // Query profile/role from database
      const profileRes = await query(
        `SELECT p.id, p.email, p.full_name, p.role, p.status, sp.staff_role
         FROM profiles p
         LEFT JOIN staff_profiles sp ON sp.user_id = p.id
         WHERE p.id = $1::uuid OR p.email = $2`,
        [sbUser.id, sbUser.email]
      )

      if (profileRes.rows.length > 0) {
        const p = profileRes.rows[0]
        return {
          id: p.id,
          email: p.email,
          name: p.full_name || sbUser.user_metadata?.full_name || p.email.split("@")[0],
          role: (p.role as any) || sbUser.user_metadata?.role || "customer",
          staffRole: p.staff_role,
        }
      }

      // Fallback to metadata
      return {
        id: sbUser.id,
        email: sbUser.email || "",
        name: sbUser.user_metadata?.full_name || sbUser.email?.split("@")[0] || "Customer",
        role: sbUser.user_metadata?.role || "customer",
      }
    }
  } catch (err) {
    console.warn("Supabase token resolve error:", err)
  }

  return null
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null

  if (!token) {
    res.status(401).json({ error: "Authentication required" })
    return
  }

  const user = await resolveAuthUser(token)
  if (!user) {
    res.status(401).json({ error: "Invalid or expired authentication session" })
    return
  }

  req.user = user
  next()
}

export async function optionalToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null

  if (token) {
    const user = await resolveAuthUser(token)
    if (user) {
      req.user = user
    }
  }
  next()
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" })
      return
    }

    // super-admin can access admin and staff roles
    const userRole = req.user.role
    const isSuperAdmin = userRole === "super-admin"
    const allowed = roles.includes(userRole) || (isSuperAdmin && (roles.includes("admin") || roles.includes("staff")))

    if (!allowed) {
      res.status(403).json({ error: "Forbidden: insufficient permissions" })
      return
    }

    next()
  }
}
