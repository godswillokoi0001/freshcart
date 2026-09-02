import * as React from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard, ClipboardList, Package, Tag, Truck, ShoppingBag, Users, UserCheck, UserPlus, Users2,
  CreditCard, Ticket, MessageSquare, BarChart2, Bell, Settings, Menu, X, LogOut, ChevronRight
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
  const [collapsedGroups, setCollapsedGroups] = React.useState<string[]>([])

  const handleSignOut = () => { signOut(); navigate("/sign-in") }

  return (
    <div className="flex h-screen bg-navy-50">
      <aside className={cn("fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-navy-200 transition-transform lg:static lg:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-navy-200 px-4">
            <span className="font-heading text-xl font-bold text-navy-900">Admin Portal</span>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-navy-400">{group.title}</p>
                {group.items.map((item) => {
                  const active = location.pathname === item.to || (item.to !== "/admin" && location.pathname.startsWith(item.to))
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
              </div>
            ))}
          </nav>
          <div className="border-t border-navy-200 p-4">
            <div className="flex items-center gap-3 px-3 py-2 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fresh-100 text-fresh-700">
                {user?.name?.split(" ").map((n) => n[0]).join("") || "A"}
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

      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <div className="flex flex-1 flex-col lg:ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-navy-200 bg-white px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-navy-900">
            {navGroups.flatMap((g) => g.items).find((n) => location.pathname === n.to || location.pathname.startsWith(n.to))?.label || "Dashboard"}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
