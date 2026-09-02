import { StatCard } from "@components/shared/StatCard"
import { LineChart, DonutChart, BarChart } from "@components/shared/Charts"
import { revenueSeries, ordersSeries, topProducts, statusDistribution, categoryRevenue, customerGrowth } from "@data/analytics"
import { adminOrders } from "@data/admin-orders"
import { products } from "@data/products"
import { customers } from "@data/admin"
import { staff } from "@data/people"
import { formatNaira } from "@lib/format"
import { DollarSign, ShoppingBag, Clock, AlertTriangle, Users, Package, TrendingUp } from "lucide-react"

const stats = [
  { label: "Today's Revenue", value: "₦804K", icon: DollarSign, accent: "fresh" as const, trend: { value: "+12% vs yesterday", positive: true } },
  { label: "Total Orders", value: "101", icon: ShoppingBag, accent: "info" as const, trend: { value: "+8 vs yesterday", positive: true } },
  { label: "Pending Orders", value: "31", icon: Clock, accent: "warning" as const },
  { label: "Low Stock", value: products.filter(p => p.stockStatus === "LOW_STOCK").length.toString(), icon: AlertTriangle, accent: "danger" as const },
]

export function AdminDashboardPage() {
  const recentOrders = adminOrders.slice(0, 5)
  const lowStock = products.filter(p => p.stockStatus === "LOW_STOCK" || p.stockStatus === "OUT_OF_STOCK").slice(0, 5)
  const recentCustomers = customers.slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-navy-500">FreshCart Supermarket — Business Overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <section className="rounded-lg border border-navy-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-navy-900">Revenue Overview (30 Days)</h2>
            <LineChart data={revenueSeries} height={260} className="mt-4" stroke="#16a34a" />
          </section>

          <section className="rounded-lg border border-navy-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-navy-900">Orders (30 Days)</h2>
            <LineChart data={ordersSeries} height={260} className="mt-4" stroke="#0ea5e9" />
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-lg border border-navy-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-navy-900">Order Status Distribution</h2>
              <DonutChart data={statusDistribution} size={220} className="mt-4" />
            </section>
            <section className="rounded-lg border border-navy-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-navy-900">Revenue by Category</h2>
              <DonutChart data={categoryRevenue.map((c, i) => ({ label: c.label, value: c.value, color: ["#16a34a","#0ea5e9","#f59e0b","#ef4444","#8b5cf6","#64748b"][i] }))} size={220} className="mt-4" />
            </section>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-navy-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-navy-900">Top Selling Products</h2></div>
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-100 text-navy-600 font-semibold">{i + 1}</span>
                  <div className="flex-1 min-w-0"><p className="font-medium text-navy-900 truncate">{p.name}</p><p className="text-sm text-navy-500">{p.category} · {p.unitsSold.toLocaleString()} units</p></div>
                  <span className="font-semibold text-navy-900">{formatNaira(p.revenue)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-navy-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-navy-900">Recent Orders</h2></div>
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border border-navy-100 hover:bg-navy-50">
                  <div className="flex items-center gap-3"><Package className="h-4 w-4 text-navy-400" /><div><p className="font-medium text-navy-900">{o.orderNumber}</p><p className="text-sm text-navy-500">{o.customerName} · {formatNaira(o.total)}</p></div></div>
                  <span className="text-sm text-navy-500">Pending</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-navy-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-navy-900">Low Stock Products</h2></div>
            <div className="space-y-3">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-navy-100 hover:bg-navy-50">
                  <div className="flex items-center gap-3"><AlertTriangle className="h-4 w-4 text-danger-600" /><div><p className="font-medium text-navy-900">{p.name}</p><p className="text-sm text-navy-500">{p.stock} left · {p.unit}</p></div></div>
                  <span className="text-sm font-medium text-danger-600">{p.stockStatus}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-navy-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-navy-900">Recent Customers</h2></div>
            <div className="space-y-3">
              {recentCustomers.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-navy-100 hover:bg-navy-50">
                  <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-fresh-100 text-fresh-700 font-semibold text-sm">{c.name.split(" ").map(n => n[0]).join("")}</div><div><p className="font-medium text-navy-900">{c.name}</p><p className="text-sm text-navy-500">{c.ordersCount} orders · {formatNaira(c.totalSpent)}</p></div></div>
                  <span className="text-sm text-navy-500">Active</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="rounded-lg border border-navy-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-navy-900">Customer Growth (6 Months)</h2>
        <BarChart data={customerGrowth} horizontal className="mt-4" />
      </section>
    </div>
  )
}
