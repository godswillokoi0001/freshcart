import * as React from "react"
import { supabase } from "@lib/supabase"
import { authApi, getToken, setToken, removeToken } from "../services/api"

export type UserRole = "customer" | "staff" | "rider" | "admin" | "super-admin"

export interface SessionUser {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  status?: string
}

interface AuthContextValue {
  user: SessionUser | null
  token: string | null
  loading: boolean
  signIn: (emailOrRole: string, passwordOrName?: string) => Promise<SessionUser>
  login: (email: string, password?: string) => Promise<SessionUser>
  register: (data: { name: string; email: string; password?: string; phone?: string }) => Promise<SessionUser>
  signOut: () => Promise<void>
  isSignedIn: boolean
  isAuthenticated: boolean
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

const USER_STORAGE_KEY = "freshcart-session"

function loadStoredUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<SessionUser | null>(loadStoredUser)
  const [token, setTokenState] = React.useState<string | null>(getToken)
  const [loading, setLoading] = React.useState<boolean>(true)

  const syncUserSession = React.useCallback(async (accessToken: string, sbUser?: any) => {
    setToken(accessToken)
    setTokenState(accessToken)

    try {
      // 1. Fetch fresh profile from backend
      const res = await authApi.getMe()
      if (res && res.user) {
        const u: SessionUser = {
          id: res.user.id,
          name: res.user.name || res.user.full_name || "Customer",
          email: res.user.email,
          phone: res.user.phone,
          role: (res.user.role as UserRole) || "customer",
          status: res.user.status,
        }
        setUser(u)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u))
        return u
      }
    } catch {
      // Backend /me failed, fallback to Supabase user metadata
      if (sbUser) {
        const u: SessionUser = {
          id: sbUser.id,
          name: sbUser.user_metadata?.full_name || sbUser.email?.split("@")[0] || "Customer",
          email: sbUser.email || "",
          phone: sbUser.user_metadata?.phone,
          role: (sbUser.user_metadata?.role as UserRole) || "customer",
        }
        setUser(u)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u))
        return u
      }
    }
    return null
  }, [])

  // Initialize session on mount
  React.useEffect(() => {
    let isMounted = true

    async function initSession() {
      try {
        // 1. Check Supabase Auth session first
        const { data: { session } } = await supabase.auth.getSession()
        if (session && session.access_token) {
          if (isMounted) {
            await syncUserSession(session.access_token, session.user)
          }
        } else {
          // 2. Fallback to existing stored token
          const existingToken = getToken()
          if (existingToken) {
            try {
              const res = await authApi.getMe()
              if (isMounted && res.user) {
                const u: SessionUser = {
                  id: res.user.id,
                  name: res.user.name || res.user.full_name || "Customer",
                  email: res.user.email,
                  phone: res.user.phone,
                  role: (res.user.role as UserRole) || "customer",
                  status: res.user.status,
                }
                setUser(u)
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u))
              }
            } catch {
              if (isMounted) {
                removeToken()
                setTokenState(null)
                setUser(null)
                localStorage.removeItem(USER_STORAGE_KEY)
              }
            }
          }
        }
      } catch (err) {
        console.warn("Auth initialization warning:", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initSession()

    // 3. Listen for Supabase Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.access_token) {
        await syncUserSession(session.access_token, session.user)
      } else if (event === "SIGNED_OUT") {
        removeToken()
        setTokenState(null)
        setUser(null)
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [syncUserSession])

  const login = React.useCallback(async (email: string, password?: string): Promise<SessionUser> => {
    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password || ""

    // 1. Try Supabase Auth first
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      })

      if (!error && data?.session?.access_token) {
        const u = await syncUserSession(data.session.access_token, data.user)
        if (u) return u
      }
    } catch (sbErr: any) {
      console.warn("Supabase signIn error, trying backend auth:", sbErr.message)
    }

    // 2. Fallback to backend /api/auth/login
    const res = await authApi.login({ email: cleanEmail, password: cleanPassword })
    setToken(res.token)
    setTokenState(res.token)
    const u: SessionUser = {
      id: res.user.id,
      name: res.user.name || res.user.full_name || "Customer",
      email: res.user.email,
      phone: res.user.phone,
      role: (res.user.role as UserRole) || "customer",
      status: res.user.status,
    }
    setUser(u)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u))
    return u
  }, [syncUserSession])

  const signIn = React.useCallback(async (emailOrRole: string, passwordOrName?: string): Promise<SessionUser> => {
    // If an email address is provided
    if (emailOrRole.includes("@")) {
      return login(emailOrRole, passwordOrName)
    }

    // If a role is passed (e.g. for developer account switching)
    const roleEmailMap: Record<string, string> = {
      "super-admin": "superadmin@freshcart.ng",
      admin: "admin@freshcart.ng",
      staff: "staff@freshcart.ng",
      rider: "rider@freshcart.ng",
      customer: "customer@freshcart.ng",
    }
    const targetEmail = roleEmailMap[emailOrRole] || "customer@freshcart.ng"
    return login(targetEmail, "FreshCart2026!")
  }, [login])

  const register = React.useCallback(
    async (data: { name: string; email: string; password?: string; phone?: string }): Promise<SessionUser> => {
      const cleanEmail = data.email.trim().toLowerCase()
      const cleanPassword = data.password || "FreshCart2026!"

      // 1. Sign up on Supabase Auth
      try {
        await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: data.name.trim(),
              phone: data.phone?.trim(),
              role: "customer",
            },
          },
        })
      } catch (err: any) {
        console.warn("Supabase signUp warning:", err.message)
      }

      // 2. Register on backend
      const res = await authApi.register({
        name: data.name,
        email: cleanEmail,
        password: cleanPassword,
        phone: data.phone,
      })

      setToken(res.token)
      setTokenState(res.token)
      const u: SessionUser = {
        id: res.user.id,
        name: res.user.name || res.user.full_name || data.name,
        email: res.user.email,
        phone: res.user.phone,
        role: (res.user.role as UserRole) || "customer",
        status: res.user.status,
      }
      setUser(u)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u))
      return u
    },
    []
  )

  const signOut = React.useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.warn("Supabase signOut error:", err)
    }
    removeToken()
    setTokenState(null)
    setUser(null)
    localStorage.removeItem(USER_STORAGE_KEY)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn,
        login,
        register,
        signOut,
        isSignedIn: !!user,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
