import * as React from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard, ClipboardList, Package, Tag, Truck, ShoppingBag, Users, UserCheck, UserPlus, Users2,
  CreditCard, Ticket, MessageSquare, BarChart2, Bell, Settings, Menu, X, LogOut, ChevronRight, Store, ExternalLink
} from "lucide-react"
import { Button } from "@components/ui/Button"
import { useAuth } from "@context/AuthContext"
import { cn } from "@lib/utils"

const navGroups = [
  { title: "Overview", items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    title: "Operations",
    items: [
      { to: "/admin/orders", label: "Orders", icon: ClipboardList },
      { to: "/admin/products", label: "Products", icon: Package },
      { to: "/admin/categories", label: "Categories", icon: Tag },
      { to: "/admin/brands", label: "Brands", icon: Truck },
      { to: "/admin/inventory", label: "Inventory", icon: ShoppingBag },
    ],
  },
  {
    title: "People",
    items: [
      { to: "/admin/customers", label: "Customers", icon: Users },
      { to: "/admin/staff", label: "Staff", icon: UserCheck },
      { to: "/admin/riders", label: "Riders", icon: Users2 },
      { to: "/admin/deliveries", label: "Deliveries", icon: Truck },
    ],
  },
  {
    title: "Marketing & Support",
    items: [
      { to: "/admin/coupons", label: "Coupons", icon: CreditCard },
      { to: "/admin/promotions", label: "Promotions", icon: MessageSquare },
      { to: "/admin/reviews", label: "Reviews", icon: MessageSquare },
      { to: "/admin/support", label: "Support", icon: Ticket },
    ],
  },
  {
    title: "Analytics & Settings",
    items: [
      { to: "/admin/reports", label: "Reports", icon: BarChart2 },
      { to: "/admin/notifications", label: "Notifications", icon: Bell },
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
]

export function AdminLayout() {
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

  const currentTitle = navGroups.flatMap((g) => g.items).find((n) => location.pathname === n.to || (n.to !== "/admin" && location.pathname.startsWith(n.to)))?.label || "Admin Portal"

  return (
    <div className="flex h-screen w-full overflow-hidden bg-navy-50">
      {/* Sidebar navigation */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] shrink-0 bg-white border-r border-navy-200 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-navy-200 px-4">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-fresh-600 text-white font-bold text-lg">
                FC
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-base font-bold text-navy-900 leading-tight">FreshCart</span>
                <span className="text-[11px] font-semibold text-fresh-700 uppercase tracking-wider">Admin Portal</span>
              </div>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden text-navy-500 hover:text-navy-900" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-navy-400">{group.title}</p>
                {group.items.map((item) => {
                  const active = location.pathname === item.to || (item.to !== "/admin" && location.pathname.startsWith(item.to))
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[38px] text-sm font-medium transition-colors",
                        active ? "bg-fresh-50 text-fresh-700 font-semibold" : "text-navy-600 hover:bg-navy-50 hover:text-navy-900"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-fresh-600" : "text-navy-400")} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>

          <div className="border-t border-navy-200 p-3 bg-navy-50/50">
            <div className="flex items-center gap-3 px-2 py-2 text-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fresh-100 text-fresh-700 font-bold text-xs">
                {user?.name?.split(" ").map((n) => n[0]).join("") || "AD"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy-900 truncate text-xs sm:text-sm">{user?.name || "Administrator"}</p>
                <p className="text-[11px] text-navy-500 truncate">{user?.email || "admin@freshcart.ng"}</p>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link
                to="/"
                className="flex items-center justify-center gap-1.5 rounded-md border border-navy-200 bg-white py-1.5 text-xs font-medium text-navy-700 hover:bg-navy-50 hover:text-navy-900 shadow-2xs"
              >
                <Store className="h-3.5 w-3.5 text-navy-500" />
                Store
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center justify-center gap-1.5 rounded-md border border-danger-200 bg-danger-50 py-1.5 text-xs font-medium text-danger-700 hover:bg-danger-100 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5 text-danger-500" />
                Exit
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main layout container - NO lg:ml-64 because aside is in natural flex flow */}
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-navy-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-navy-600 hover:bg-navy-50"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="hidden sm:inline-flex items-center rounded-md bg-fresh-50 px-2 py-0.5 text-xs font-semibold text-fresh-700 border border-fresh-200">
                Admin
              </span>
              <h1 className="text-base sm:text-lg font-bold text-navy-900 truncate">
                {currentTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 bg-white px-2.5 py-1.5 text-xs font-medium text-navy-700 hover:bg-navy-50 hover:text-navy-900 shadow-2xs"
            >
              <Store className="h-3.5 w-3.5 text-fresh-600" />
              <span className="hidden sm:inline">View Store</span>
              <ExternalLink className="h-3 w-3 text-navy-400" />
            </Link>
            <div className="h-4 w-px bg-navy-200 hidden sm:block" />
            <div className="flex items-center gap-2 pl-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fresh-100 text-fresh-700 font-bold text-xs">
                {user?.name?.split(" ").map((n) => n[0]).join("") || "AD"}
              </div>
              <span className="hidden md:inline text-xs font-medium text-navy-700 truncate max-w-[120px]">
                {user?.name || "Admin"}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
