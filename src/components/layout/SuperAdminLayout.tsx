import * as React from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, Users, Shield, Activity, FileText, Menu, X, LogOut, Key, Settings } from "lucide-react"
import { Button } from "@components/ui/Button"
import { useAuth } from "@context/AuthContext"
import { cn } from "@lib/utils"

const nav = [
  { to: "/super-admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/super-admin/admins", label: "Admins", icon: Users },
  { to: "/super-admin/permissions", label: "Permissions", icon: Shield },
  { to: "/super-admin/security", label: "Security", icon: Activity },
  { to: "/super-admin/audit-logs", label: "Audit Logs", icon: FileText },
  { to: "/super-admin/system-settings", label: "System Settings", icon: Settings },
]

export function SuperAdminLayout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleSignOut = () => { signOut(); navigate("/sign-in") }

  return (
    <div className="flex h-screen bg-navy-900">
      <aside className={cn("fixed inset-y-0 left-0 z-50 w-64 bg-navy-950 border-r border-navy-800 transition-transform lg:static lg:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-navy-800 px-4">
            <span className="font-heading text-xl font-bold text-fresh-400">Super Admin</span>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(false)}><X className="h-5 w-5 text-navy-300" /></Button>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {nav.map(item => {
              const active = location.pathname === item.to || (item.to !== "/super-admin" && location.pathname.startsWith(item.to))
              return (
                <Link key={item.to} to={item.to} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-navy-800 text-fresh-400" : "text-navy-300 hover:bg-navy-800 hover:text-white")}>
                  <item.icon className="h-5 w-5" /> {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-navy-800 p-4">
            <div className="flex items-center gap-3 px-3 py-2 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fresh-900/30 text-fresh-400">
                {user?.name?.split(" ").map(n => n[0]).join("") || "SA"}
              </div>
              <div className="min-w-0 flex-1"><p className="font-medium text-white truncate">{user?.name}</p><p className="text-xs text-navy-400">{user?.email}</p></div>
            </div>
            <Button variant="outline" className="mt-3 w-full text-navy-300 hover:text-white border-navy-700" onClick={handleSignOut}><LogOut className="h-4 w-4" /> Sign Out</Button>
          </div>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <div className="flex flex-1 flex-col lg:ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-navy-800 bg-navy-950 px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5 text-navy-300" /></Button>
          <h1 className="text-lg font-semibold text-white">{nav.find(n => location.pathname === n.to || location.pathname.startsWith(n.to))?.label || "Dashboard"}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
