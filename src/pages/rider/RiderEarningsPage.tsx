import { DollarSign, TrendingUp, Calendar, CheckCircle2 } from "lucide-react"
import { StatCard } from "@components/shared/StatCard"
import { LineChart, BarChart } from "@components/shared/Charts"
import { riderEarnings, deliveries } from "@data/people"
import { formatNaira } from "@lib/format"

const completedToday = deliveries.filter((d) => d.riderId === "rider-1" && d.status === "DELIVERED")
const completedWeek = deliveries.filter((d) => d.riderId === "rider-1" && d.status === "DELIVERED").slice(0, 20)

export function RiderEarningsPage() {
  const todayEarnings = completedToday.reduce((s, d) => s + d.deliveryFee, 0)
  const weekEarnings = completedWeek.reduce((s, d) => s + d.deliveryFee, 0)
  const totalDeliveries = deliveries.filter((d) => d.riderId === "rider-1" && d.status === "DELIVERED").length

  const dailyData = [
    { label: "Mon", value: 8400 },
    { label: "Tue", value: 11200 },
    { label: "Wed", value: 7600 },
    { label: "Thu", value: 12800 },
    { label: "Fri", value: 10400 },
    { label: "Sat", value: 15600 },
    { label: "Sun", value: 6800 },
  ]

  const weeklyData = [
    { label: "Week 1", value: 58400 },
    { label: "Week 2", value: 67200 },
    { label: "Week 3", value: 71600 },
    { label: "Week 4", value: 69800 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Earnings</h1>
        <p className="mt-1 text-sm text-navy-500">Track your delivery income and performance.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Earnings" value={formatNaira(todayEarnings)} icon={DollarSign} accent="fresh" />
        <StatCard label="This Week" value={formatNaira(weekEarnings)} icon={Calendar} accent="info" />
        <StatCard label="Total Deliveries" value={totalDeliveries.toString()} icon={CheckCircle2} accent="success" />
        <StatCard label="Avg / Delivery" value={formatNaira(totalDeliveries ? weekEarnings / totalDeliveries : 0)} icon={TrendingUp} accent="warning" />
      </div>

      <section className="rounded-lg border border-navy-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-navy-900">Daily Earnings (This Week)</h2>
        <LineChart data={dailyData} height={200} className="mt-4" />
      </section>

      <section className="rounded-lg border border-navy-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-navy-900">Weekly Earnings (This Month)</h2>
        <BarChart data={weeklyData} horizontal className="mt-4" />
      </section>

      <section className="rounded-lg border border-navy-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-navy-900">Recent Deliveries</h2>
        <div className="mt-4 space-y-2">
          {completedWeek.slice(0, 10).map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-lg border border-navy-200 bg-white p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-50"><CheckCircle2 className="h-4 w-4 text-success-600" /></div>
                <div>
                  <p className="font-medium text-navy-900">{d.orderId}</p>
                  <p className="text-sm text-navy-500">{d.area} · {formatNaira(d.deliveryFee)}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-navy-900">{formatNaira(d.deliveryFee)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
