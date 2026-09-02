import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { ChevronRight, User, Package, Heart, Bell, Settings, LogOut, MapPin, Pencil, Trash2, CreditCard } from "lucide-react"
import { useToast } from "@context/ToastContext"
import { Button } from "@components/ui/Button"
import { Avatar, AvatarFallback } from "@components/ui/Avatar"
import { AddressCard } from "@components/customer/AddressCard"
import { OrderStatusBadge } from "@components/shared/StatusBadges"
import { useAuth } from "@context/AuthContext"
import { orders, ordersForCustomer, currentCustomer, addresses } from "@data/orders"
import { formatNaira, formatDate } from "@lib/format"
import { cn } from "@lib/utils"

const tabs = [
  { id: "overview", label: "Overview", icon: <User className="h-4 w-4" /> },
  { id: "orders", label: "Orders", icon: <Package className="h-4 w-4" /> },
  { id: "addresses", label: "Addresses", icon: <MapPin className="h-4 w-4" /> },
  { id: "profile", label: "Profile", icon: <Settings className="h-4 w-4" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
] as const

export function AccountPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = React.useState<(typeof tabs)[number]["id"]>(tabs[0].id)
  const [editingProfile, setEditingProfile] = React.useState(false)
  const { success } = useToast()
  const [profile, setProfile] = React.useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: currentCustomer.phone,
  })

  if (!user) {
    return (
      <div className="container py-8">
        <h1 className="mb-2 text-2xl font-bold text-navy-900">My Account</h1>
        <p className="text-sm text-navy-500">Please sign in to access your account.</p>
        <div className="mt-4 flex gap-3">
          <Button asChild><Link to="/sign-in">Sign In</Link></Button>
          <Button variant="outline" asChild><Link to="/sign-up">Create Account</Link></Button>
        </div>
      </div>
    )
  }

  const myOrders = ordersForCustomer(user.email)
  const recentOrders = myOrders.slice(0, 3)

  const handleSaveProfile = () => {
    setEditingProfile(false)
    success("Profile updated", "Your profile changes have been saved.")
  }

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-lg border border-navy-200 bg-white p-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-fresh-100 text-xl font-semibold text-fresh-700">
                  {profile.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-navy-900">{profile.name}</h2>
                <p className="text-sm text-navy-500">{profile.email}</p>
                <p className="mt-1 text-sm text-navy-500">{profile.phone}</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => setEditingProfile(true)}>
                  <Pencil className="h-4 w-4" /> Edit Profile
                </Button>
              </div>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total Orders", value: currentCustomer.ordersCount.toString() },
                { label: "Total Spent", value: formatNaira(currentCustomer.totalSpent) },
                { label: "Member Since", value: formatDate(currentCustomer.joinedAt) },
                { label: "Saved Items", value: "—" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-navy-200 bg-white p-4">
                  <dt className="text-sm font-medium text-navy-500">{s.label}</dt>
                  <dd className="mt-1 text-xl font-bold text-navy-900">{s.value}</dd>
                </div>
              ))}
            </dl>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-navy-900">Recent Orders</h3>
                <Link to="/orders" className="text-sm font-medium text-fresh-700 hover:underline">View all</Link>
              </div>
              {recentOrders.length === 0 ? (
                <p className="rounded-lg border border-navy-200 bg-white p-4 text-center text-sm text-navy-500">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((o) => (
                    <Link
                      key={o.id}
                      to={`/orders/${o.id}`}
                      className="flex items-center justify-between rounded-lg border border-navy-200 bg-white p-3 hover:border-navy-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50">
                          <Package className="h-5 w-5 text-navy-400" />
                        </div>
                        <div>
                          <p className="font-medium text-navy-900">{o.orderNumber}</p>
                          <p className="text-sm text-navy-500">{formatDate(o.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-navy-900">{formatNaira(o.total)}</p>
                        <OrderStatusBadge status={o.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <Button variant="outline" className="w-full text-danger-600 hover:bg-danger-50" onClick={() => { signOut(); navigate("/") }}>
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        )
      case "orders":
        return (
          <div className="space-y-3">
            {myOrders.length === 0 ? (
              <p className="rounded-lg border border-navy-200 bg-white p-8 text-center text-sm text-navy-500">You haven't placed any orders yet.</p>
            ) : (
              myOrders.map((o) => (
                <Link
                  key={o.id}
                  to={`/orders/${o.id}`}
                  className="flex items-center justify-between rounded-lg border border-navy-200 bg-white p-4 hover:border-navy-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50">
                      <Package className="h-5 w-5 text-navy-400" />
                    </div>
                    <div>
                      <p className="font-medium text-navy-900">{o.orderNumber}</p>
                      <p className="text-sm text-navy-500">{formatDate(o.createdAt)} · {o.items.length} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-navy-900">{formatNaira(o.total)}</p>
                    <OrderStatusBadge status={o.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        )
      case "addresses":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-navy-900">Saved Addresses</h3>
              <Button size="sm" onClick={() => setActiveTab("addresses")}>
                + Add Address
              </Button>
            </div>
            {addresses.map((a) => (
              <AddressCard
                key={a.id}
                address={a}
                onEdit={() => setActiveTab("addresses")}
                onDelete={() => {
                  if (confirm("Remove this address?")) {
                    setActiveTab("addresses")
                  }
                }}
              />
            ))}
          </div>
        )
      case "profile":
        return (
          <div className="max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-navy-900">Profile Information</h3>
            {editingProfile ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-navy-700">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="mt-1 w-full rounded-md border border-navy-300 px-3 py-2 text-sm focus:border-fresh-500 focus:outline-none focus:ring-1 focus:ring-fresh-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="mt-1 w-full rounded-md border border-navy-300 px-3 py-2 text-sm focus:border-fresh-500 focus:outline-none focus:ring-1 focus:ring-fresh-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700">Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="mt-1 w-full rounded-md border border-navy-300 px-3 py-2 text-sm focus:border-fresh-500 focus:outline-none focus:ring-1 focus:ring-fresh-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setEditingProfile(false)}>Cancel</Button>
                </div>
              </>
            ) : (
              <dl className="space-y-4">
                <div className="rounded-lg border border-navy-200 bg-white p-4">
                  <dt className="text-sm font-medium text-navy-500">Full Name</dt>
                  <dd className="mt-1 font-medium text-navy-900">{profile.name}</dd>
                </div>
                <div className="rounded-lg border border-navy-200 bg-white p-4">
                  <dt className="text-sm font-medium text-navy-500">Email</dt>
                  <dd className="mt-1 font-medium text-navy-900">{profile.email}</dd>
                </div>
                <div className="rounded-lg border border-navy-200 bg-white p-4">
                  <dt className="text-sm font-medium text-navy-500">Phone</dt>
                  <dd className="mt-1 font-medium text-navy-900">{profile.phone}</dd>
                </div>
                <Button onClick={() => setEditingProfile(true)}><Pencil className="h-4 w-4" /> Edit Profile</Button>
              </dl>
            )}
          </div>
        )
      case "notifications":
        return (
          <div className="rounded-lg border border-navy-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-navy-900">Notification Preferences</h3>
            <p className="mt-1 text-sm text-navy-500">Manage how FreshCart communicates with you.</p>
            <div className="mt-4 space-y-3">
              {[
                { label: "Order updates", desc: "Status changes, delivery alerts", enabled: true },
                { label: "Promotional offers", desc: "Deals, coupons, new arrivals", enabled: true },
                { label: "Product restocks", desc: "Back-in-stock alerts for wishlisted items", enabled: false },
              ].map((n) => (
                <label key={n.label} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-navy-900">{n.label}</p>
                    <p className="text-sm text-navy-500">{n.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked={n.enabled} className="h-4 w-4 rounded border-navy-300 text-fresh-600 focus:ring-fresh-500" />
                </label>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-bold text-navy-900">My Account</h1>
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24">
          <nav className="rounded-lg border border-navy-200 bg-white">
            <ul className="divide-y divide-navy-100">
              {tabs.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setActiveTab(t.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors",
                      activeTab === t.id
                        ? "bg-fresh-50 text-fresh-700 border-r-2 border-fresh-600"
                        : "text-navy-600 hover:bg-navy-50"
                    )}
                  >
                    {t.icon} {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <div>{renderTab()}</div>
      </div>
    </div>
  )
}
