import * as React from "react"
import { Link } from "react-router-dom"
import { StatCard } from "@components/shared/StatCard"
import { LineChart, DonutChart, BarChart } from "@components/shared/Charts"
import { revenueSeries, ordersSeries, topProducts, statusDistribution, categoryRevenue, customerGrowth } from "@data/analytics"
import { useOrders } from "@context/OrdersContext"
import { products } from "@data/products"
import { customers } from "@data/admin"
import { formatNaira } from "@lib/format"
import { DollarSign, ShoppingBag, Clock, AlertTriangle, Package, ChevronRight } from "lucide-react"
import { Button } from "@components/ui/Button"

export function AdminDashboardPage() {
  const { orders } = useOrders()
  const recentOrders = orders.slice(0, 6)
  const pendingOrders = orders.filter((o) => o.status === "PENDING" || o.status === "CONFIRMED")
  const paidOrders = orders.filter((o) => o.paymentStatus === "PAID")
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)

  const lowStock = products.filter((p) => p.stockStatus === "LOW_STOCK" || p.stockStatus === "OUT_OF_STOCK").slice(0, 5)
  const recentCustomers = customers.slice(0, 5)

  const stats = [
    {
      label: "Gross Revenue",
      value: formatNaira(totalRevenue > 0 ? totalRevenue : 804200),
      icon: DollarSign,
      accent: "fresh" as const,
      trend: { value: "+12.4% vs last week", positive: true },
    },
    {
      label: "Total Orders",
      value: String(orders.length > 0 ? orders.length : 101),
      icon: ShoppingBag,
      accent: "info" as const,
      trend: { value: `${orders.length} active recorded`, positive: true },
    },
    {
      label: "Pending Orders",
      value: String(pendingOrders.length),
      icon: Clock,
      accent: "warning" as const,
    },
    {
      label: "Low Stock Items",
      value: String(lowStock.length),
      icon: AlertTriangle,
      accent: "danger" as const,
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900">Admin Operations Dashboard</h1>
          <p className="mt-0.5 text-xs sm:text-sm text-navy-500">FreshCart Nigeria — Multi-Channel Business Operations</p>
        </div>
        <Button size="sm" asChild className="self-start sm:self-auto">
          <Link to="/admin/orders">
            Manage Orders <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-xl border border-navy-200 bg-white p-4 sm:p-6 shadow-xs overflow-hidden">
            <h2 className="text-base font-bold text-navy-900">Revenue Performance Trend (30 Days)</h2>
            <LineChart data={revenueSeries} height={260} className="mt-4" stroke="#16a34a" />
          </section>

          <section className="rounded-xl border border-navy-200 bg-white p-4 sm:p-6 shadow-xs overflow-hidden">
            <h2 className="text-base font-bold text-navy-900">Daily Order Volumes</h2>
            <LineChart data={ordersSeries} height={260} className="mt-4" stroke="#0ea5e9" />
          </section>

          <div className="grid gap-6 sm:grid-cols-2">
            <section className="rounded-xl border border-navy-200 bg-white p-4 sm:p-6 shadow-xs flex flex-col items-center">
              <h2 className="text-base font-bold text-navy-900 self-start mb-2">Order Status Distribution</h2>
              <DonutChart data={statusDistribution} size={200} className="mt-2" />
            </section>
            <section className="rounded-xl border border-navy-200 bg-white p-4 sm:p-6 shadow-xs flex flex-col items-center">
              <h2 className="text-base font-bold text-navy-900 self-start mb-2">Revenue by Category</h2>
              <DonutChart
                data={categoryRevenue.map((c, i) => ({
                  label: c.label,
                  value: c.value,
                  color: ["#16a34a", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6", "#64748b"][i % 6],
                }))}
                size={200}
                className="mt-2"
              />
            </section>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-navy-200 bg-white p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-navy-900">Recent Live Orders</h2>
              <Link to="/admin/orders" className="text-xs font-semibold text-fresh-700 hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-2.5">
              {recentOrders.map((o) => (
                <Link
                  key={o.id}
                  to={`/admin/orders`}
                  className="flex items-center justify-between p-3 rounded-lg border border-navy-100 hover:bg-navy-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-600">
                      <Package className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-navy-900 text-sm truncate">#{o.orderNumber}</p>
                      <p className="text-xs text-navy-500 truncate">
                        {o.customerName} · {formatNaira(o.total)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-navy-700 bg-navy-100 px-2 py-0.5 rounded-full shrink-0">
                    {o.status}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-navy-200 bg-white p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-navy-900">Inventory Alerts</h2>
              <Link to="/admin/inventory" className="text-xs font-semibold text-fresh-700 hover:underline">
                Manage
              </Link>
            </div>
            <div className="space-y-2.5">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-navy-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger-50 text-danger-600">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-navy-900 text-sm truncate">{p.name}</p>
                      <p className="text-xs text-navy-500 truncate">
                        {p.stock} left · {p.unit}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-danger-600 shrink-0">{p.stockStatus}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-navy-200 bg-white p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-navy-900">Recent Customers</h2>
              <Link to="/admin/customers" className="text-xs font-semibold text-fresh-700 hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-2.5">
              {recentCustomers.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-navy-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fresh-100 text-fresh-700 font-bold text-xs">
                      {c.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-navy-900 text-sm truncate">{c.name}</p>
                      <p className="text-xs text-navy-500 truncate">
                        {c.ordersCount} orders · {formatNaira(c.totalSpent)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-fresh-700 bg-fresh-50 px-2 py-0.5 rounded-full shrink-0">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="rounded-xl border border-navy-200 bg-white p-4 sm:p-6 shadow-xs">
        <h2 className="mb-4 text-base font-bold text-navy-900">Customer Growth Momentum (6 Months)</h2>
        <BarChart data={customerGrowth} horizontal className="mt-4" />
      </section>
    </div>
  )
}
