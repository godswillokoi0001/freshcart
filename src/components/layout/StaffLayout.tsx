import React from "react"
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import { LayoutDashboard, ClipboardList, PackageSearch, User, Menu, X, ChevronRight, LogOut } from "lucide-react"
import { Button } from "@components/ui/Button"
import { useAuth } from "@context/AuthContext"
import { cn } from "@lib/utils"

const nav = [
  { to: "/staff", label: "Dashboard", icon: LayoutDashboard },
  { to: "/staff/orders", label: "Orders", icon: ClipboardList },
  { to: "/staff/inventory", label: "Inventory", icon: PackageSearch },
  { to: "/staff/profile", label: "Profile", icon: User },
]

export function StaffLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleSignOut = () => {
    signOut()
    navigate("/sign-in")
  }

  return (
    <div className="flex h-screen bg-navy-50">
      <aside className={cn("fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-navy-200 transition-transform lg:static lg:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-navy-200 px-4">
            <span className="font-heading text-xl font-bold text-navy-900">Staff Portal</span>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {nav.map((item) => {
              const active = location.pathname === item.to || (item.to !== "/staff" && location.pathname.startsWith(item.to))
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-fresh-50 text-fresh-700" : "text-navy-600 hover:bg-navy-50 hover:text-navy-900"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-navy-200 p-4">
            <div className="flex items-center gap-3 px-3 py-2 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fresh-100 text-fresh-700">
                {user?.name?.split(" ").map((n) => n[0]).join("") || "S"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-navy-900 truncate">{user?.name}</p>
                <p className="text-xs text-navy-500">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" className="mt-3 w-full" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className="flex flex-1 flex-col lg:ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-navy-200 bg-white px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-navy-900">{nav.find((n) => location.pathname === n.to || location.pathname.startsWith(n.to))?.label || "Dashboard"}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
