import * as React from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  ClipboardList,
  History,
  DollarSign,
  User,
  Menu,
  X,
  LogOut,
  Bike,
  Store,
  ExternalLink,
  Power,
  Navigation,
  CheckCircle2,
  Bell
} from "lucide-react"
import { Button } from "@components/ui/Button"
import { useAuth } from "@context/AuthContext"
import { useOrders } from "@context/OrdersContext"
import { useToast } from "@context/ToastContext"
import { cn } from "@lib/utils"

const nav = [
  { to: "/rider", label: "Dashboard", icon: LayoutDashboard },
  { to: "/rider/deliveries", label: "Deliveries", icon: ClipboardList, showBadge: true },
  { to: "/rider/history", label: "History", icon: History },
  { to: "/rider/earnings", label: "Earnings", icon: DollarSign },
  { to: "/rider/profile", label: "Profile", icon: User },
]

export function RiderLayout() {
  const { user, signOut } = useAuth()
  const { orders } = useOrders()
  const { success, info } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false)
  const [isOnline, setIsOnline] = React.useState(true)

  // Count active trips assigned to rider
  const activeDeliveriesCount = React.useMemo(() => {
    return orders.filter(
      (o) =>
        o.status === "OUT_FOR_DELIVERY" ||
        o.status === "READY_FOR_PICKUP" ||
        o.status === "PACKED" ||
        (o.status === "PREPARING" && o.riderId)
    ).length
  }, [orders])

  // Auto-close mobile drawer on route change & handle escape key
  React.useEffect(() => {
    setMobileDrawerOpen(false)
  }, [location.pathname])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileDrawerOpen) {
        setMobileDrawerOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [mobileDrawerOpen])

  const toggleOnline = () => {
    const next = !isOnline
    setIsOnline(next)
    if (next) {
      success("You are Online", "Available to receive dispatch and delivery orders.")
    } else {
      info("You are Offline", "You will not receive new order assignments.")
    }
  }

  const handleSignOut = () => {
    signOut()
    navigate("/sign-in")
  }

  const currentNav = nav.find(
    (n) =>
      location.pathname === n.to ||
      (n.to !== "/rider" && location.pathname.startsWith(n.to))
  )

  return (
    <div className="flex h-screen w-full overflow-hidden bg-navy-50">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] shrink-0 bg-white border-r border-navy-200 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          mobileDrawerOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Brand header */}
          <div className="flex h-16 items-center justify-between border-b border-navy-200 px-4">
            <Link to="/rider" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-fresh-600 text-white shadow-xs">
                <Bike className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-base font-bold text-navy-900 leading-tight">FreshCart</span>
                <span className="text-[11px] font-semibold text-fresh-700 uppercase tracking-wider">Rider Logistics</span>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-navy-500 hover:text-navy-900"
              onClick={() => setMobileDrawerOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Status Toggle Card */}
          <div className="p-3">
            <div className={cn(
              "rounded-xl border p-3 transition-colors",
              isOnline ? "bg-fresh-50/70 border-fresh-200" : "bg-navy-100/50 border-navy-200"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("flex h-2.5 w-2.5 rounded-full", isOnline ? "bg-fresh-500 animate-pulse" : "bg-navy-400")} />
                  <span className="text-xs font-bold text-navy-900">
                    {isOnline ? "Duty: Online" : "Duty: Offline"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleOnline}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all shadow-2xs",
                    isOnline ? "bg-fresh-600 text-white hover:bg-fresh-700" : "bg-navy-700 text-white hover:bg-navy-800"
                  )}
                >
                  <Power className="h-3 w-3" />
                  {isOnline ? "Go Offline" : "Go Online"}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-navy-500">
                {isOnline ? "Ready for route dispatches" : "Break mode active"}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-navy-400 mb-2">Navigation</p>
            {nav.map((item) => {
              const active =
                location.pathname === item.to ||
                (item.to !== "/rider" && location.pathname.startsWith(item.to))
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[38px] text-sm font-medium transition-colors",
                    active
                      ? "bg-fresh-50 text-fresh-700 font-semibold"
                      : "text-navy-600 hover:bg-navy-50 hover:text-navy-900"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <item.icon className={cn("h-5 w-5 shrink-0", active ? "text-fresh-600" : "text-navy-400")} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.showBadge && activeDeliveriesCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-fresh-600 px-1.5 text-[11px] font-bold text-white shadow-2xs">
                      {activeDeliveriesCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Rider profile & signout footer */}
          <div className="border-t border-navy-200 p-3 bg-navy-50/50">
            <div className="flex items-center gap-3 px-2 py-2 text-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fresh-100 text-fresh-700 font-bold text-xs">
                {user?.name?.split(" ").map((n) => n[0]).join("") || "ME"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy-900 truncate text-xs sm:text-sm">{user?.name || "Michael Eze"}</p>
                <p className="text-[11px] text-navy-500 truncate">{user?.email || "rider@freshcart.ng"}</p>
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
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-navy-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-navy-600 hover:bg-navy-50"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open navigation drawer"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="hidden sm:inline-flex items-center rounded-md bg-fresh-50 px-2 py-0.5 text-xs font-semibold text-fresh-700 border border-fresh-200">
                Rider
              </span>
              <h1 className="text-base sm:text-lg font-bold text-navy-900 truncate">
                {currentNav?.label || "Rider Dashboard"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Status Button on Mobile Header */}
            <button
              type="button"
              onClick={toggleOnline}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all border",
                isOnline
                  ? "bg-fresh-50 border-fresh-300 text-fresh-800"
                  : "bg-navy-100 border-navy-300 text-navy-700"
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", isOnline ? "bg-fresh-600 animate-pulse" : "bg-navy-400")} />
              <span>{isOnline ? "Online" : "Offline"}</span>
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-lg border border-navy-200 bg-white px-2 py-1 text-xs font-medium text-navy-700 hover:bg-navy-50 shadow-2xs"
            >
              <Store className="h-3.5 w-3.5 text-fresh-600" />
              <span className="hidden sm:inline">Store</span>
            </Link>

            <div className="flex items-center gap-2 pl-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fresh-100 text-fresh-700 font-bold text-xs">
                {user?.name?.split(" ").map((n) => n[0]).join("") || "ME"}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Area (with padding bottom on mobile for fixed bottom bar) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 min-w-0">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>

        {/* Fixed Mobile Bottom Navigation Bar (Rider Friendly) */}
        <nav
          className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-navy-200 lg:hidden shadow-lg"
          aria-label="Mobile Bottom Navigation"
        >
          <div className="grid grid-cols-5 h-16">
            {nav.map((item) => {
              const active =
                location.pathname === item.to ||
                (item.to !== "/rider" && location.pathname.startsWith(item.to))
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 transition-colors relative",
                    active ? "text-fresh-700 font-semibold" : "text-navy-500 hover:text-navy-900"
                  )}
                >
                  <div className="relative">
                    <item.icon className={cn("h-5 w-5", active ? "text-fresh-600" : "text-navy-500")} />
                    {item.showBadge && activeDeliveriesCount > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-fresh-600 px-1 text-[10px] font-bold text-white shadow-2xs">
                        {activeDeliveriesCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] leading-tight truncate max-w-[64px]">
                    {item.label}
                  </span>
                  {active && (
                    <span className="absolute top-0 inset-x-4 h-0.5 bg-fresh-600 rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
