import { Link } from "react-router-dom"
import { Package, Truck, CheckCircle2, DollarSign, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@components/ui/Button"
import { StatCard } from "@components/shared/StatCard"
import { deliveries, availableRiders, riderEarnings } from "@data/people"
import { formatNaira } from "@lib/format"

const stats = [
  { label: "Today's Deliveries", value: "8", icon: Package, accent: "fresh" as const },
  { label: "Completed", value: "5", icon: CheckCircle2, accent: "success" as const },
  { label: "Active", value: "2", icon: Truck, accent: "info" as const },
  { label: "Today's Earnings", value: formatNaira(11200), icon: DollarSign, accent: "fresh" as const },
]

export function RiderDashboardPage() {
  const myDeliveries = deliveries.filter((d) => d.riderId === "rider-1" && d.status !== "DELIVERED")
  const completedToday = deliveries.filter((d) => d.riderId === "rider-1" && d.status === "DELIVERED")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Good morning, Michael</h1>
        <p className="mt-1 text-sm text-navy-500">Here's your delivery overview for today.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy-900">Active Deliveries</h2>
          <Button variant="ghost" size="sm" asChild><Link to="/rider/deliveries">View all</Link></Button>
        </div>
        <div className="space-y-3">
          {myDeliveries.length === 0 ? (
            <div className="rounded-lg border border-navy-200 bg-white p-6 text-center text-sm text-navy-500">
              No active deliveries. Check back for new assignments.
            </div>
          ) : (
            myDeliveries.map((d) => (
              <Link key={d.id} to={`/rider/deliveries/${d.id}`} className="block rounded-lg border border-navy-200 bg-white p-4 shadow-sm hover:border-navy-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fresh-50">
                      <Package className="h-5 w-5 text-fresh-700" />
                    </div>
                    <div>
                      <p className="font-medium text-navy-900">{d.orderId}</p>
                      <p className="text-sm text-navy-500">{d.itemsCount} items · {d.area}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy-900">Completed Today</h2>
          <Button variant="ghost" size="sm" asChild><Link to="/rider/history">View all</Link></Button>
        </div>
        <div className="space-y-2">
          {completedToday.slice(0, 3).map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-lg border border-navy-200 bg-white p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-50"><CheckCircle2 className="h-4 w-4 text-success-600" /></div>
                <div>
                  <p className="font-medium text-navy-900">{d.orderId}</p>
                  <p className="text-sm text-navy-500">{d.area} · {formatNaira(d.deliveryFee)}</p>
                </div>
              </div>
            </div>
          ))}
          {completedToday.length === 0 && (
            <div className="rounded-lg border border-navy-200 bg-white p-6 text-center text-sm text-navy-500">
              No completed deliveries today.
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-navy-900">Performance This Week</h2>
        <div className="rounded-lg border border-navy-200 bg-white p-4">
          <dl className="grid gap-4 sm:grid-cols-3">
            <div><dt className="text-sm text-navy-500">Deliveries</dt><dd className="mt-1 text-2xl font-bold text-navy-900">486</dd></div>
            <div><dt className="text-sm text-navy-500">Rating</dt><dd className="mt-1 text-2xl font-bold text-navy-900">4.8</dd></div>
            <div><dt className="text-sm text-navy-500">On-time Rate</dt><dd className="mt-1 text-2xl font-bold text-navy-900">97%</dd></div>
          </dl>
        </div>
      </section>
    </div>
  )
}
