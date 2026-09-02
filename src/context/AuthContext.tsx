import * as React from "react"

export type UserRole = "customer" | "staff" | "rider" | "admin" | "super-admin"

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AuthContextValue {
  user: SessionUser | null
  signIn: (role: UserRole, name?: string) => void
  signOut: () => void
  isSignedIn: boolean
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

const STORAGE_KEY = "freshcart-session"

const roleNames: Record<UserRole, string> = {
  customer: "Amaka Obi",
  staff: "Bola Adeyemi",
  rider: "Michael Eze",
  admin: "Sarah Okonkwo",
  "super-admin": "Uche Nwankwo",
}

function load(): SessionUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<SessionUser | null>(load)

  React.useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  }, [user])

  const signIn = React.useCallback((role: UserRole, name?: string) => {
    setUser({ id: `${role}-${Date.now()}`, name: name || roleNames[role], email: demoEmail(role), role })
  }, [])

  const signOut = React.useCallback(() => setUser(null), [])

  return (
    <AuthContext.Provider value={{ user, signIn, signOut: signOut, isSignedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

function demoEmail(role: UserRole) {
  return `${role.replace("-", "")}@demo.freshcart.ng`
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
