import * as React from "react"
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom"
import {
  Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, LogOut, Package,
  Bell, LayoutDashboard, Home, Store, Tags, BadgePercent, ClipboardList, UserRound,
} from "lucide-react"
import { Logo } from "@components/shared/Logo"
import { Button } from "@components/ui/Button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@components/ui/DropdownMenu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@components/ui/Sheet"
import { useCart } from "@context/CartContext"
import { useWishlist } from "@context/WishlistContext"
import { useAuth } from "@context/AuthContext"
import { useToast } from "@context/ToastContext"
import { categories } from "@data/categories"
import { cn } from "@lib/utils"

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
  { to: "/deals", label: "Deals" },
  { to: "/orders", label: "Orders" },
  { to: "/wishlist", label: "Wishlist" },
]

function Header() {
  const [query, setQuery] = React.useState("")
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { itemCount } = useCart()
  const { user, signIn, signOut } = useAuth()
  const { count: wishlistCount } = useWishlist()
  const { success } = useToast()

  React.useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(query.trim() ? `/shop?q=${encodeURIComponent(query.trim())}` : "/shop")
  }

  return (
    <header className="sticky top-0 z-40 border-b border-navy-200 bg-white">
      <div className="container">
        <div className="flex h-16 items-center gap-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-xs sm:w-80 p-0">
              <SheetHeader className="border-b border-navy-100 p-4 text-left">
                <SheetTitle><Logo /></SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-4 overflow-y-auto max-h-[calc(100vh-5rem)]">
                {navLinks.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center min-h-[44px] rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive ? "bg-fresh-50 text-fresh-700 font-semibold" : "text-navy-700 hover:bg-navy-50"
                      )
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
                <div className="mt-3 border-t border-navy-100 pt-3">
                  <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-navy-400">Top categories</p>
                  {categories.slice(0, 8).map((c) => (
                    <Link
                      key={c.id}
                      to={`/categories/${c.slug}`}
                      className="flex items-center min-h-[44px] rounded-md px-3 py-2 text-sm text-navy-600 hover:bg-navy-50 transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <Logo />

          <form onSubmit={submitSearch} className="relative ml-2 hidden flex-1 md:block" role="search">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for rice, milk, spaghetti…"
              className="h-10 w-full rounded-md border border-navy-200 bg-navy-50 pl-9 pr-4 text-sm placeholder:text-navy-400 focus:border-fresh-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-fresh-500"
              aria-label="Search products"
            />
          </form>

          <nav className="ml-2 hidden items-center gap-1 lg:flex">
            {navLinks.slice(1, 4).map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium",
                    isActive ? "text-fresh-700" : "text-navy-600 hover:text-navy-900"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild className="relative" aria-label="Wishlist">
              <Link to="/wishlist">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="relative" aria-label="Cart">
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-fresh-600 px-1 text-[10px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Account">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user && user.role === "customer" ? (
                  <>
                    <DropdownMenuLabel>
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs font-normal text-navy-500">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/account"><User className="mr-2 h-4 w-4" /> My Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders"><Package className="mr-2 h-4 w-4" /> My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/notifications"><Bell className="mr-2 h-4 w-4" /> Notifications</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        signOut()
                        success("Signed out", "See you soon!")
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Welcome to FreshCart</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/sign-in")}>
                      <User className="mr-2 h-4 w-4" /> Sign In
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/sign-up")}>
                      <UserRound className="mr-2 h-4 w-4" /> Create Account
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs font-normal text-navy-400">
                      Demo staff & ops views
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => signIn("staff")}>
                      <ClipboardList className="mr-2 h-4 w-4" /> Staff Portal
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signIn("rider")}>
                      <Home className="mr-2 h-4 w-4" /> Rider App
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signIn("admin")}>
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signIn("super-admin")}>
                      <Tags className="mr-2 h-4 w-4" /> Super Admin
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <form onSubmit={submitSearch} className="relative pb-3 md:hidden" role="search">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="h-10 w-full rounded-md border border-navy-200 bg-navy-50 pl-9 pr-4 text-sm placeholder:text-navy-400 focus:border-fresh-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-fresh-500"
            aria-label="Search products"
          />
        </form>
      </div>
    </header>
  )
}

const footerLinks = [
  {
    title: "Shop",
    links: [
      { label: "All Products", to: "/shop" },
      { label: "Categories", to: "/categories" },
      { label: "Today's Deals", to: "/deals" },
    ],
  },
  {
    title: "Your Account",
    links: [
      { label: "Orders", to: "/orders" },
      { label: "Wishlist", to: "/wishlist" },
      { label: "Notifications", to: "/notifications" },
      { label: "Account", to: "/account" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Home", to: "/" },
      { label: "Sign In", to: "/sign-in" },
      { label: "Create Account", to: "/sign-up" },
    ],
  },
]

function Footer() {
  return (
    <footer className="border-t border-navy-200 bg-navy-50">
      <div className="container py-10 sm:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-navy-500 leading-relaxed">
              Nigeria's own online supermarket. Groceries, household essentials and fresh produce — delivered to your door.
            </p>
          </div>
          {footerLinks.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-navy-900">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-navy-500 hover:text-fresh-700 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-navy-200 pt-6 sm:flex-row">
          <p className="text-xs text-navy-400">© 2026 FreshCart Supermarket. All rights reserved.</p>
          <p className="text-xs text-navy-400">Lagos · Abuja · Port Harcourt</p>
        </div>
      </div>
    </footer>
  )
}

function MobileBottomNav() {
  const location = useLocation()
  const { itemCount } = useCart()
  const { user } = useAuth()

  const tabs = [
    { to: "/", label: "Home", icon: Home },
    { to: "/shop", label: "Shop", icon: Store },
    { to: "/categories", label: "Aisles", icon: Tags },
    { to: "/deals", label: "Deals", icon: BadgePercent },
    { to: "/cart", label: "Cart", icon: ShoppingCart, badge: itemCount },
    { to: user ? "/orders" : "/sign-in", label: user ? "Orders" : "Account", icon: user ? Package : User },
  ]

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-navy-200 md:hidden shadow-lg"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-6 h-16">
        {tabs.map((tab) => {
          const active =
            location.pathname === tab.to ||
            (tab.to !== "/" && location.pathname.startsWith(tab.to))
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors relative min-w-0 px-1",
                active ? "text-fresh-700 font-semibold" : "text-navy-500 hover:text-navy-900"
              )}
            >
              <div className="relative">
                <tab.icon className={cn("h-5 w-5 shrink-0", active ? "text-fresh-600" : "text-navy-500")} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-fresh-600 px-1 text-[10px] font-bold text-white shadow-2xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-tight truncate w-full text-center">
                {tab.label}
              </span>
              {active && (
                <span className="absolute top-0 inset-x-3 h-0.5 bg-fresh-600 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function CustomerLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
