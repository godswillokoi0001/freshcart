import * as React from "react"
import { Link } from "react-router-dom"
import { Package, Truck, CheckCircle2, DollarSign, Clock, MapPin, ChevronRight, Navigation } from "lucide-react"
import { Button } from "@components/ui/Button"
import { StatCard } from "@components/shared/StatCard"
import { useAuth } from "@context/AuthContext"
import { useOrders } from "@context/OrdersContext"
import { formatNaira } from "@lib/format"

export function RiderDashboardPage() {
  const { user } = useAuth()
  const { orders } = useOrders()

  // Filter orders assigned or ready for dispatch
  const activeTrips = orders.filter(
    (o) =>
      o.status === "OUT_FOR_DELIVERY" ||
      o.status === "READY_FOR_PICKUP" ||
      o.status === "PACKED"
  )

  const completedToday = orders.filter((o) => o.status === "DELIVERED")

  const totalEarningsToday = completedToday.reduce((acc, o) => acc + (o.deliveryFee || 1500), 0)

  const stats = [
    {
      label: "Active Deliveries",
      value: String(activeTrips.length),
      icon: Truck,
      accent: "info" as const,
    },
    {
      label: "Completed Today",
      value: String(completedToday.length),
      icon: CheckCircle2,
      accent: "fresh" as const,
    },
    {
      label: "Today's Delivery Fee",
      value: formatNaira(totalEarningsToday > 0 ? totalEarningsToday : 12500),
      icon: DollarSign,
      accent: "fresh" as const,
    },
    {
      label: "Customer Rating",
      value: "4.95 ★",
      icon: Package,
      accent: "warning" as const,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900">
            Welcome back, {user?.name || "Rider"}
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-navy-500">
            Assigned Lagos dispatch route & active drop-off queue.
          </p>
        </div>
        <Button size="sm" asChild className="self-start sm:self-auto">
          <Link to="/rider/deliveries">
            <Navigation className="mr-1.5 h-3.5 w-3.5" /> Start Trip View
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Deliveries */}
        <section className="rounded-xl border border-navy-200 bg-white p-4 sm:p-6 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-900">Active Delivery Assignments</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/rider/deliveries">
                View all <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {activeTrips.length === 0 ? (
              <div className="rounded-lg border border-dashed border-navy-200 bg-navy-50/50 p-6 text-center text-xs sm:text-sm text-navy-500">
                No active delivery assignments. You are ready for dispatch.
              </div>
            ) : (
              activeTrips.slice(0, 4).map((d) => (
                <Link
                  key={d.id}
                  to={`/rider/deliveries/${d.id}`}
                  className="block rounded-lg border border-navy-200 p-3 sm:p-4 hover:border-fresh-400 hover:bg-fresh-50/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-fresh-100 text-fresh-700">
                        <Truck className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-navy-900 text-sm truncate">#{d.orderNumber}</p>
                        <p className="text-xs text-navy-500 truncate flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-navy-400 shrink-0" />
                          {d.deliveryAddress?.city || d.deliveryAddress?.line1 || "Lagos Delivery"}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-fresh-100 px-2.5 py-0.5 text-xs font-semibold text-fresh-800 shrink-0">
                      {d.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Completed Deliveries */}
        <section className="rounded-xl border border-navy-200 bg-white p-4 sm:p-6 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-900">Completed Deliveries Today</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/rider/history">
                History <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="space-y-2.5">
            {completedToday.slice(0, 4).map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-lg border border-navy-100 p-3 hover:bg-navy-50/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fresh-50 text-fresh-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-navy-900 text-sm truncate">#{d.orderNumber}</p>
                    <p className="text-xs text-navy-500 truncate">
                      {d.deliveryAddress?.city || "Lagos"} · {formatNaira(d.deliveryFee || 1500)} fee
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-fresh-700">Delivered</span>
              </div>
            ))}
            {completedToday.length === 0 && (
              <div className="rounded-lg border border-dashed border-navy-200 bg-navy-50/50 p-6 text-center text-xs sm:text-sm text-navy-500">
                No deliveries marked completed yet today.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Rider Performance */}
      <section className="rounded-xl border border-navy-200 bg-white p-4 sm:p-6 shadow-xs">
        <h2 className="mb-3 text-base font-bold text-navy-900">Weekly Performance Summary</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-navy-50/70 p-3 border border-navy-100">
            <p className="text-xs text-navy-500">Total Deliveries</p>
            <p className="mt-1 text-xl font-bold text-navy-900">84 Trips</p>
          </div>
          <div className="rounded-lg bg-navy-50/70 p-3 border border-navy-100">
            <p className="text-xs text-navy-500">On-Time Arrival Rate</p>
            <p className="mt-1 text-xl font-bold text-fresh-700">98.4%</p>
          </div>
          <div className="rounded-lg bg-navy-50/70 p-3 border border-navy-100">
            <p className="text-xs text-navy-500">Rider Payout Balance</p>
            <p className="mt-1 text-xl font-bold text-navy-900">{formatNaira(68000)}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
