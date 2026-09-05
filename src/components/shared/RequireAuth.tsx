import * as React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth, type UserRole } from "@context/AuthContext"

interface RequireAuthProps {
  children: React.ReactNode
  roles?: UserRole[] | UserRole
}

export function RequireAuth({ children, roles }: RequireAuthProps) {
  const { user, loading, isSignedIn } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-fresh-600 border-t-transparent" />
          <p className="text-xs font-medium text-navy-500">Checking authorization…</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn || !user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  if (roles) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles]
    const userRole = user.role

    // super-admin can access admin and staff routes as well
    const hasRole =
      allowedRoles.includes(userRole) ||
      (userRole === "super-admin" && (allowedRoles.includes("admin") || allowedRoles.includes("staff")))

    if (!hasRole) {
      return <Navigate to="/403" replace />
    }
  }

  return <>{children}</>
}
