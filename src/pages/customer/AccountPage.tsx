import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { User, Package, Bell, Settings, LogOut, MapPin, Pencil, Plus } from "lucide-react"
import { useToast } from "@context/ToastContext"
import { Button } from "@components/ui/Button"
import { Avatar, AvatarFallback } from "@components/ui/Avatar"
import { AddressCard } from "@components/customer/AddressCard"
import { OrderStatusBadge } from "@components/shared/StatusBadges"
import { useAuth } from "@context/AuthContext"
import { useOrders } from "@context/OrdersContext"
import { useWishlist } from "@context/WishlistContext"
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
  const { orders, addresses, addAddress, deleteAddress, setDefaultAddress } = useOrders()
  const { count: wishlistCount } = useWishlist()
  const navigate = useNavigate()
  const { success, error } = useToast()

  const [activeTab, setActiveTab] = React.useState<(typeof tabs)[number]["id"]>(tabs[0].id)
  const [editingProfile, setEditingProfile] = React.useState(false)
  const [showAddAddress, setShowAddAddress] = React.useState(false)

  const [newAddr, setNewAddr] = React.useState({
    fullName: user?.name || "",
    phone: "+234 803 555 1234",
    line1: "",
    line2: "",
    city: "Ikeja",
    state: "Lagos State",
    label: "Home",
  })

  const [profile, setProfile] = React.useState({
    name: user?.name || "Valued Customer",
    email: user?.email || "customer@freshcart.ng",
    phone: "+234 803 555 1234",
  })

  if (!user) {
    return (
      <div className="container py-12">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">My Account</h1>
        <p className="text-sm text-slate-500">Please sign in to access your FreshCart account.</p>
        <div className="mt-4 flex gap-3">
          <Button asChild><Link to="/sign-in">Sign In</Link></Button>
          <Button variant="outline" asChild><Link to="/sign-up">Create Account</Link></Button>
        </div>
      </div>
    )
  }

  // Filter orders for this customer
  const myOrders = orders.filter(
    (o) => o.customerId === user.id || user.role === "customer" || user.id === "cust-1"
  )
  const recentOrders = myOrders.slice(0, 3)
  const totalSpent = myOrders.reduce((sum, o) => sum + o.total, 0)

  const handleSaveProfile = () => {
    setEditingProfile(false)
    success("Profile Updated", "Your account profile details have been saved.")
  }

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAddr.fullName.trim() || !newAddr.line1.trim() || !newAddr.phone.trim()) {
      error("Missing Information", "Please provide a name, street address, and contact phone.")
      return
    }
    addAddress({
      fullName: newAddr.fullName,
      phone: newAddr.phone,
      line1: newAddr.line1,
      line2: newAddr.line2 || undefined,
      city: newAddr.city,
      state: newAddr.state,
      label: newAddr.label,
      isDefault: addresses.length === 0,
    })
    setShowAddAddress(false)
    setNewAddr({
      fullName: user.name || "",
      phone: "+234 803 555 1234",
      line1: "",
      line2: "",
      city: "Ikeja",
      state: "Lagos State",
      label: "Home",
    })
  }

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-emerald-100 text-xl font-bold text-emerald-800">
                  {profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2) || "FC"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
                <p className="text-xs text-slate-500">{profile.email}</p>
                <p className="mt-0.5 text-xs text-slate-500">{profile.phone}</p>
                <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs" onClick={() => setEditingProfile(true)}>
                  <Pencil className="h-3 w-3 mr-1" /> Edit Profile
                </Button>
              </div>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total Orders", value: myOrders.length.toString() },
                { label: "Total Spent", value: formatNaira(totalSpent) },
                { label: "Saved Items", value: wishlistCount.toString() },
                { label: "Delivery Addresses", value: addresses.length.toString() },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <dt className="text-xs font-semibold text-slate-500">{s.label}</dt>
                  <dd className="mt-1 text-xl font-extrabold text-slate-900">{s.value}</dd>
                </div>
              ))}
            </dl>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
                <Link to="/orders" className="text-xs font-bold text-emerald-700 hover:underline">
                  View all ({myOrders.length})
                </Link>
              </div>
              {recentOrders.length === 0 ? (
                <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
                  No orders placed yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((o) => (
                    <Link
                      key={o.id}
                      to={`/orders/${o.orderNumber}`}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{o.orderNumber}</p>
                          <p className="text-xs text-slate-500">{formatDate(o.createdAt)} · {o.items.length} items</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-slate-900 text-sm">{formatNaira(o.total)}</p>
                        <OrderStatusBadge status={o.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        )
      case "orders":
        return (
          <div className="space-y-3">
            {myOrders.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
                You haven't placed any orders yet.
              </p>
            ) : (
              myOrders.map((o) => (
                <Link
                  key={o.id}
                  to={`/orders/${o.orderNumber}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-all hover:shadow-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{o.orderNumber}</p>
                      <p className="text-xs text-slate-500">{formatDate(o.createdAt)} · {o.items.length} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-slate-900 text-sm">{formatNaira(o.total)}</p>
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
              <h3 className="text-lg font-bold text-slate-900">Saved Delivery Addresses</h3>
              <Button size="sm" onClick={() => setShowAddAddress(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Address
              </Button>
            </div>

            {showAddAddress && (
              <form onSubmit={handleCreateAddress} className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-3">
                <h4 className="text-sm font-bold text-slate-900">Add New Destination</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Full Name</label>
                    <input
                      type="text"
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Contact Phone</label>
                    <input
                      type="tel"
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Address Line 1</label>
                  <input
                    type="text"
                    value={newAddr.line1}
                    onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-none"
                    placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                    required
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">City / Area</label>
                    <input
                      type="text"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">State</label>
                    <input
                      type="text"
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Label (Home, Work, etc.)</label>
                    <input
                      type="text"
                      value={newAddr.label}
                      onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" size="sm">Save Address</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddAddress(false)}>Cancel</Button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {addresses.map((a) => (
                <div key={a.id} className="relative group">
                  <AddressCard
                    address={a}
                    onSelect={() => setDefaultAddress(a.id)}
                    selected={a.isDefault}
                    onDelete={() => {
                      if (confirm("Remove this address from your account?")) {
                        deleteAddress(a.id)
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )
      case "profile":
        return (
          <div className="max-w-md space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Profile Information</h3>
            {editingProfile ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={handleSaveProfile}>Save Changes</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingProfile(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <dl className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <dt className="text-xs font-semibold text-slate-500">Full Name</dt>
                  <dd className="mt-1 font-bold text-slate-900 text-sm">{profile.name}</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <dt className="text-xs font-semibold text-slate-500">Email</dt>
                  <dd className="mt-1 font-bold text-slate-900 text-sm">{profile.email}</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <dt className="text-xs font-semibold text-slate-500">Phone</dt>
                  <dd className="mt-1 font-bold text-slate-900 text-sm">{profile.phone}</dd>
                </div>
                <Button size="sm" onClick={() => setEditingProfile(true)}>
                  <Pencil className="h-4 w-4 mr-1.5" /> Edit Profile
                </Button>
              </dl>
            )}
          </div>
        )
      case "notifications":
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900">Notification Preferences</h3>
            <p className="mt-1 text-xs text-slate-500">Manage how FreshCart notifies you about deliveries and flash deals.</p>
            <div className="mt-4 space-y-4">
              {[
                { label: "Delivery Status Alerts", desc: "SMS and in-app notifications as rider dispatches", enabled: true },
                { label: "Fresh Daily Grocery Specials", desc: "Exclusive discounts and seasonal produce arrivals", enabled: true },
                { label: "Back-in-Stock Alerts", desc: "Notifications when wishlisted items are replenished", enabled: false },
              ].map((n) => (
                <label key={n.label} className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{n.label}</p>
                    <p className="text-xs text-slate-500">{n.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={n.enabled}
                    onChange={() => success("Preference Saved", "Notification setting updated.")}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
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
      <h1 className="mb-6 text-2xl font-black text-slate-900 sm:text-3xl">My Account</h1>
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24">
          <nav className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <ul className="divide-y divide-slate-100">
              {tabs.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setActiveTab(t.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 text-left text-xs font-bold transition-colors",
                      activeTab === t.id
                        ? "bg-emerald-50 text-emerald-800 border-r-4 border-emerald-600"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {t.icon} {t.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    signOut()
                    navigate("/")
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </li>
            </ul>
          </nav>
        </aside>
        <div>{renderTab()}</div>
      </div>
    </div>
  )
}
