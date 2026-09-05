import * as React from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, Users, Shield, Activity, FileText, Menu, X, LogOut, Key, Settings, Store, ExternalLink } from "lucide-react"
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

  // Auto-close mobile drawer on route change & handle escape key
  React.useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [mobileOpen])

  const handleSignOut = () => { signOut(); navigate("/sign-in") }

  const currentNav = nav.find(n => location.pathname === n.to || (n.to !== "/super-admin" && location.pathname.startsWith(n.to)))

  return (
    <div className="flex h-screen w-full overflow-hidden bg-navy-950 text-white">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] shrink-0 bg-navy-900 border-r border-navy-800 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-navy-800 px-4">
            <Link to="/super-admin" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600/90 text-white font-bold text-lg shadow-sm">
                SA
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-base font-bold text-white leading-tight">FreshCart</span>
                <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">Super Admin</span>
              </div>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden text-navy-400 hover:text-white" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-navy-500 mb-2">Governance</p>
            {nav.map(item => {
              const active = location.pathname === item.to || (item.to !== "/super-admin" && location.pathname.startsWith(item.to))
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[38px] text-sm font-medium transition-colors",
                    active ? "bg-navy-800 text-fresh-400 font-semibold border-l-2 border-fresh-500 rounded-l-none" : "text-navy-300 hover:bg-navy-800/60 hover:text-white"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-fresh-400" : "text-navy-500")} />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-navy-800 p-3 bg-navy-950/60">
            <div className="flex items-center gap-3 px-2 py-2 text-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-950 text-red-300 border border-red-800 font-bold text-xs">
                {user?.name?.split(" ").map(n => n[0]).join("") || "SA"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white truncate text-xs sm:text-sm">{user?.name || "Super Admin"}</p>
                <p className="text-[11px] text-navy-400 truncate">{user?.email || "root@freshcart.ng"}</p>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link
                to="/"
                className="flex items-center justify-center gap-1.5 rounded-md border border-navy-700 bg-navy-800/80 py-1.5 text-xs font-medium text-navy-200 hover:bg-navy-700 hover:text-white"
              >
                <Store className="h-3.5 w-3.5 text-navy-400" />
                Store
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center justify-center gap-1.5 rounded-md border border-red-900/60 bg-red-950/50 py-1.5 text-xs font-medium text-red-300 hover:bg-red-900/60 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5 text-red-400" />
                Exit
              </button>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main container */}
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-navy-800 bg-navy-900 px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="lg:hidden text-navy-300 hover:bg-navy-800" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="hidden sm:inline-flex items-center rounded-md bg-red-950/80 px-2 py-0.5 text-xs font-semibold text-red-300 border border-red-800">
                Root
              </span>
              <h1 className="text-base sm:text-lg font-bold text-white truncate">
                {currentNav?.label || "Super Admin"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-navy-700 bg-navy-800 px-2.5 py-1.5 text-xs font-medium text-navy-200 hover:bg-navy-700 hover:text-white"
            >
              <Store className="h-3.5 w-3.5 text-fresh-400" />
              <span className="hidden sm:inline">View Store</span>
              <ExternalLink className="h-3 w-3 text-navy-400" />
            </Link>
            <div className="h-4 w-px bg-navy-800 hidden sm:block" />
            <div className="flex items-center gap-2 pl-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-950 text-red-300 border border-red-800 font-bold text-xs">
                {user?.name?.split(" ").map(n => n[0]).join("") || "SA"}
              </div>
              <span className="hidden md:inline text-xs font-medium text-navy-300 truncate max-w-[120px]">
                {user?.name || "Super Admin"}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0 bg-navy-950">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
