import { Link } from "react-router-dom"
import { Package, Truck, Clock, AlertTriangle, ChevronRight } from "lucide-react"
import { Button } from "@components/ui/Button"
import { StatCard } from "@components/shared/StatCard"
import { adminOrders } from "@data/admin-orders"
import { products } from "@data/products"
import { staff } from "@data/people"
import { formatNaira } from "@lib/format"

const stats = [
  { label: "New Orders", value: "12", icon: Package, accent: "fresh" as const, trend: { value: "+3 vs last hour", positive: true } },
  { label: "Processing", value: "8", icon: Clock, accent: "warning" as const },
  { label: "Ready for Pickup", value: "5", icon: Truck, accent: "info" as const, trend: { value: "2 riders available", positive: true } },
  { label: "Low Stock Alerts", value: "7", icon: AlertTriangle, accent: "danger" as const },
]

export function StaffDashboardPage() {
  const myStaff = staff.find((s) => s.name === "Bola Adeyemi")
  const newOrders = adminOrders.filter((o) => o.status === "PENDING" || o.status === "CONFIRMED")
  const processing = adminOrders.filter((o) => o.status === "PREPARING")
  const ready = adminOrders.filter((o) => o.status === "READY_FOR_PICKUP")
  const lowStock = products.filter((p) => p.stockStatus === "LOW_STOCK").slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Staff Dashboard</h1>
        <p className="mt-1 text-sm text-navy-500">Welcome back, {myStaff?.name}. Here's your fulfillment overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy-900">New Orders</h2>
            <Button variant="ghost" size="sm" asChild><Link to="/staff/orders">View all <ChevronRight className="h-4 w-4" /></Link></Button>
          </div>
          <div className="rounded-lg border border-navy-200 bg-white divide-y divide-navy-100">
            {newOrders.slice(0, 5).map((o) => (
              <Link key={o.id} to={`/staff/orders/${o.id}`} className="flex items-center justify-between p-4 hover:bg-navy-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50"><Package className="h-5 w-5 text-navy-400" /></div>
                  <div>
                    <p className="font-medium text-navy-900">{o.orderNumber}</p>
                    <p className="text-sm text-navy-500">{o.items.length} items · {formatNaira(o.total)}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-navy-300" />
              </Link>
            ))}
            {newOrders.length === 0 && <div className="p-4 text-center text-sm text-navy-500">No new orders</div>}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy-900">Processing Orders</h2>
            <Button variant="ghost" size="sm" asChild><Link to="/staff/orders">View all <ChevronRight className="h-4 w-4" /></Link></Button>
          </div>
          <div className="rounded-lg border border-navy-200 bg-white divide-y divide-navy-100">
            {processing.slice(0, 5).map((o) => (
              <Link key={o.id} to={`/staff/orders/${o.id}`} className="flex items-center justify-between p-4 hover:bg-navy-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-50"><Clock className="h-5 w-5 text-warning-600" /></div>
                  <div>
                    <p className="font-medium text-navy-900">{o.orderNumber}</p>
                    <p className="text-sm text-navy-500">{o.items.length} items · {formatNaira(o.total)}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-navy-300" />
              </Link>
            ))}
            {processing.length === 0 && <div className="p-4 text-center text-sm text-navy-500">No orders in progress</div>}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy-900">Ready for Pickup</h2>
            <Button variant="ghost" size="sm" asChild><Link to="/staff/orders">View all <ChevronRight className="h-4 w-4" /></Link></Button>
          </div>
          <div className="rounded-lg border border-navy-200 bg-white divide-y divide-navy-100">
            {ready.slice(0, 5).map((o) => (
              <Link key={o.id} to={`/staff/orders/${o.id}`} className="flex items-center justify-between p-4 hover:bg-navy-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fresh-50"><Truck className="h-5 w-5 text-fresh-700" /></div>
                  <div>
                    <p className="font-medium text-navy-900">{o.orderNumber}</p>
                    <p className="text-sm text-navy-500">{o.items.length} items · {formatNaira(o.total)}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-navy-300" />
              </Link>
            ))}
            {ready.length === 0 && <div className="p-4 text-center text-sm text-navy-500">No orders ready</div>}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy-900">Low Stock Alerts</h2>
            <Button variant="ghost" size="sm" asChild><Link to="/staff/inventory">View all <ChevronRight className="h-4 w-4" /></Link></Button>
          </div>
          <div className="rounded-lg border border-navy-200 bg-white divide-y divide-navy-100">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-50"><AlertTriangle className="h-5 w-5 text-danger-600" /></div>
                  <div>
                    <p className="font-medium text-navy-900">{p.name}</p>
                    <p className="text-sm text-navy-500">{p.stock} left · {p.unit}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-danger-600">LOW STOCK</span>
              </div>
            ))}
            {lowStock.length === 0 && <div className="p-4 text-center text-sm text-navy-500">All items well stocked</div>}
          </div>
        </section>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-navy-900">Today's Fulfillment</h2>
        <div className="rounded-lg border border-navy-200 bg-white p-6 text-center">
          <p className="text-4xl font-bold text-navy-900">{myStaff?.ordersFulfilled}</p>
          <p className="mt-1 text-sm text-navy-500">Total orders fulfilled</p>
        </div>
      </section>
    </div>
  )
}
