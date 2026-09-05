import * as React from "react"
import { Link } from "react-router-dom"
import { Package, Truck, Clock, AlertTriangle, ChevronRight, CheckCircle2 } from "lucide-react"
import { Button } from "@components/ui/Button"
import { StatCard } from "@components/shared/StatCard"
import { useOrders } from "@context/OrdersContext"
import { useAuth } from "@context/AuthContext"
import { products } from "@data/products"
import { formatNaira } from "@lib/format"

export function StaffDashboardPage() {
  const { user } = useAuth()
  const { orders } = useOrders()

  const newOrders = orders.filter((o) => o.status === "PENDING" || o.status === "CONFIRMED")
  const processing = orders.filter((o) => o.status === "PREPARING")
  const ready = orders.filter((o) => o.status === "READY_FOR_PICKUP" || o.status === "PACKED")
  const completed = orders.filter((o) => o.status === "DELIVERED")
  const lowStock = products.filter((p) => p.stockStatus === "LOW_STOCK" || p.stockStatus === "OUT_OF_STOCK").slice(0, 5)

  const stats = [
    {
      label: "Pending Verification",
      value: String(newOrders.length),
      icon: Package,
      accent: "fresh" as const,
      trend: { value: `${newOrders.length} orders queue`, positive: true },
    },
    {
      label: "Picking & Packing",
      value: String(processing.length),
      icon: Clock,
      accent: "warning" as const,
    },
    {
      label: "Ready for Dispatch",
      value: String(ready.length),
      icon: Truck,
      accent: "info" as const,
    },
    {
      label: "Fulfilled Deliveries",
      value: String(completed.length),
      icon: CheckCircle2,
      accent: "fresh" as const,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Staff Operations Dashboard</h1>
        <p className="mt-1 text-sm text-navy-500">
          Welcome back, <span className="font-semibold text-navy-800">{user?.name || "Fulfillment Officer"}</span>. Real-time supermarket warehouse queue.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-xl border border-navy-200 bg-white p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-navy-900">Incoming Orders</h2>
              <p className="text-xs text-navy-500">Orders awaiting item picking</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/staff/orders">
                View all <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="divide-y divide-navy-100 rounded-lg border border-navy-100">
            {newOrders.slice(0, 5).map((o) => (
              <Link
                key={o.id}
                to={`/staff/orders/${o.id}`}
                className="flex items-center justify-between p-3.5 hover:bg-navy-50/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-fresh-50 text-fresh-700">
                    <Package className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-navy-900 text-sm truncate">#{o.orderNumber}</p>
                    <p className="text-xs text-navy-500 truncate">
                      {o.items?.length || 0} items · {formatNaira(o.total)} · {o.customerName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-full bg-fresh-100 px-2 py-0.5 text-[11px] font-semibold text-fresh-700">
                    {o.status}
                  </span>
                  <ChevronRight className="h-4 w-4 text-navy-300" />
                </div>
              </Link>
            ))}
            {newOrders.length === 0 && (
              <div className="p-6 text-center text-sm text-navy-500">No incoming orders awaiting picking.</div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-navy-200 bg-white p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-navy-900">Active Prep & Packing</h2>
              <p className="text-xs text-navy-500">Orders currently on warehouse picking tables</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/staff/orders">
                View all <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="divide-y divide-navy-100 rounded-lg border border-navy-100">
            {processing.slice(0, 5).map((o) => (
              <Link
                key={o.id}
                to={`/staff/orders/${o.id}`}
                className="flex items-center justify-between p-3.5 hover:bg-navy-50/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning-50 text-warning-600">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-navy-900 text-sm truncate">#{o.orderNumber}</p>
                    <p className="text-xs text-navy-500 truncate">
                      {o.items?.length || 0} items · {formatNaira(o.total)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-full bg-warning-100 px-2 py-0.5 text-[11px] font-semibold text-warning-800">
                    Picking
                  </span>
                  <ChevronRight className="h-4 w-4 text-navy-300" />
                </div>
              </Link>
            ))}
            {processing.length === 0 && (
              <div className="p-6 text-center text-sm text-navy-500">No orders actively in preparation.</div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-navy-200 bg-white p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-navy-900">Packed / Staged for Dispatch</h2>
              <p className="text-xs text-navy-500">Orders ready for rider handoff</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/staff/orders">
                View all <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="divide-y divide-navy-100 rounded-lg border border-navy-100">
            {ready.slice(0, 5).map((o) => (
              <Link
                key={o.id}
                to={`/staff/orders/${o.id}`}
                className="flex items-center justify-between p-3.5 hover:bg-navy-50/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info-50 text-info-700">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-navy-900 text-sm truncate">#{o.orderNumber}</p>
                    <p className="text-xs text-navy-500 truncate">
                      Rider: {o.riderName || "Pending Dispatch"} · {formatNaira(o.total)}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-navy-300 shrink-0" />
              </Link>
            ))}
            {ready.length === 0 && (
              <div className="p-6 text-center text-sm text-navy-500">No orders staged for pickup.</div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-navy-200 bg-white p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-navy-900">Low Stock Attention</h2>
              <p className="text-xs text-navy-500">Items nearing replenishment threshold</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/staff/inventory">
                View all <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="divide-y divide-navy-100 rounded-lg border border-navy-100">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger-50 text-danger-600">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-navy-900 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-navy-500 truncate">
                      {p.category} · Stock: {p.stock} {p.unit}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-danger-50 border border-danger-200 px-2 py-0.5 text-[11px] font-semibold text-danger-700 shrink-0">
                  {p.stockStatus === "OUT_OF_STOCK" ? "Out of Stock" : "Low Stock"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
