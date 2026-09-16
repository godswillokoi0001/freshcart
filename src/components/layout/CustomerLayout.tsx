import * as React from "react"
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom"
import {
  Search, ShoppingCart, Heart, User, Menu, LogOut, Package,
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
    <header className="sticky top-0 z-40 border-b border-fc-cream-200 bg-fc-chalk">
      <div className="container">
        <div className="flex h-16 items-center gap-4">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5 text-fc-earth" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-xs sm:w-80 p-0 bg-fc-chalk border-fc-cream-200">
              <SheetHeader className="border-b border-fc-cream-200 p-4 text-left">
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
                        "flex items-center min-h-[44px] px-3 py-2.5 text-sm font-semibold transition-colors",
                        isActive
                          ? "text-fc-market border-l-2 border-fc-market pl-2.5"
                          : "text-fc-earth hover:text-fc-market"
                      )
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
                <div className="mt-3 border-t border-fc-cream-200 pt-3">
                  <p className="px-3 pb-2 text-xs font-semibold text-fc-smoke">
                    Top categories
                  </p>
                  {categories.slice(0, 8).map((c) => (
                    <Link
                      key={c.id}
                      to={`/categories/${c.slug}`}
                      className="flex items-center min-h-[44px] px-3 py-2 text-sm text-fc-earth hover:text-fc-market transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <Logo />

          {/* Search — inline, not a dropdown */}
          <form onSubmit={submitSearch} className="relative ml-2 hidden flex-1 md:block" role="search">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fc-smoke" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rice, milk, spaghetti…"
              className="h-10 w-full border border-fc-cream-200 bg-white pl-9 pr-4 text-sm text-fc-earth placeholder:text-fc-smoke focus:border-fc-leaf focus:outline-none focus:ring-1 focus:ring-fc-leaf"
              style={{ borderRadius: 0 }}
              aria-label="Search products"
            />
          </form>

          {/* Desktop nav — only 3 key links, decluttered */}
          <nav className="ml-2 hidden items-center gap-1 lg:flex">
            {navLinks.slice(1, 4).map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 text-sm font-semibold transition-colors",
                    isActive ? "text-fc-market" : "text-fc-earth hover:text-fc-market"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Icon cluster */}
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild className="relative text-fc-earth hover:text-fc-market hover:bg-fc-cream" aria-label="Wishlist">
              <Link to="/wishlist">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-fc-market px-1 text-[10px] font-bold text-white"
                        style={{ borderRadius: 0 }}>
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild className="relative text-fc-earth hover:text-fc-market hover:bg-fc-cream" aria-label="Cart">
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-fc-market px-1 text-[10px] font-bold text-white"
                        style={{ borderRadius: 0 }}>
                    {itemCount}
                  </span>
                )}
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-fc-earth hover:text-fc-market hover:bg-fc-cream" aria-label="Account">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user && user.role === "customer" ? (
                  <>
                    <DropdownMenuLabel>
                      <p className="text-sm font-semibold text-fc-earth">{user.name}</p>
                      <p className="text-xs font-normal text-fc-smoke">{user.email}</p>
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
                    <DropdownMenuLabel className="text-fc-earth">Welcome to FreshCart</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/sign-in")}>
                      <User className="mr-2 h-4 w-4" /> Sign In
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/sign-up")}>
                      <UserRound className="mr-2 h-4 w-4" /> Create Account
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs font-normal text-fc-smoke">
                      Demo portals
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

        {/* Mobile search bar */}
        <form onSubmit={submitSearch} className="relative pb-3 md:hidden" role="search">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fc-smoke" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="h-10 w-full border border-fc-cream-200 bg-white pl-9 pr-4 text-sm text-fc-earth placeholder:text-fc-smoke focus:border-fc-leaf focus:outline-none focus:ring-1 focus:ring-fc-leaf"
            style={{ borderRadius: 0 }}
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
      { label: "Account Settings", to: "/account" },
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
    <footer style={{ backgroundColor: "var(--color-fc-earth)" }}>
      <div className="container py-12 sm:py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo dark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed" style={{ color: "rgba(247,242,232,0.65)" }}>
              Nigeria's own online supermarket. Fresh groceries, household essentials — delivered same day in Lagos.
            </p>
          </div>
          {footerLinks.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-bold text-fc-cream">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm transition-colors hover:text-fc-market"
                      style={{ color: "rgba(247,242,232,0.65)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar — no middle-dot separators */}
        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t pt-6 sm:flex-row sm:items-center"
             style={{ borderColor: "rgba(247,242,232,0.10)" }}>
          <p className="text-xs" style={{ color: "rgba(247,242,232,0.40)" }}>
            © 2026 FreshCart Supermarket. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "rgba(247,242,232,0.40)" }}>
            Lagos
          </p>
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
      className="fixed bottom-0 inset-x-0 z-40 bg-fc-chalk border-t border-fc-cream-200 shadow-lg md:hidden"
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
                active ? "text-fc-market font-semibold" : "text-fc-smoke hover:text-fc-earth"
              )}
            >
              <div className="relative">
                <tab.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    active ? "text-fc-market" : "text-fc-smoke"
                  )}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center bg-fc-market px-1 text-[10px] font-bold text-white"
                    style={{ borderRadius: 0 }}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-tight truncate w-full text-center">
                {tab.label}
              </span>
              {/* Active indicator — 3px top bar, fc-market */}
              {active && (
                <span className="absolute top-0 inset-x-3 h-0.5 bg-fc-market" />
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
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--color-fc-chalk)" }}>
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
