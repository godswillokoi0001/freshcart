import React from "react"
import { Download, ChevronRight, Calendar, BarChart2, DollarSign, ShoppingBag, Users, Package } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Input } from "@components/ui/Input"
import { Label } from "@components/ui/Label"
import { LineChart, BarChart, DonutChart } from "@components/shared/Charts"
import { revenueSeries, ordersSeries, topProducts, statusDistribution, categoryRevenue, customerGrowth, areasForAnalytics } from "@data/analytics"
import { formatNaira } from "@lib/format"

const periods = ["7d", "30d", "90d", "1y"] as const
const reportTypes = ["revenue", "orders", "products", "customers", "inventory", "deliveries"] as const

export function AdminReportsPage() {
  const [period, setPeriod] = React.useState<typeof periods[number]>("30d")
  const [type, setType] = React.useState<typeof reportTypes[number]>("revenue")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-navy-900">Reports</h1><p className="mt-1 text-sm text-navy-500">Business analytics and exportable reports.</p></div>
        <div className="flex flex-wrap gap-3">
          <Select value={period} onValueChange={setPeriod}><SelectTrigger className="w-32"><SelectValue placeholder="Period" /></SelectTrigger><SelectContent>{periods.map(p => <SelectItem key={p} value={p}>{p === "7d" ? "Last 7 days" : p === "30d" ? "Last 30 days" : p === "90d" ? "Last 90 days" : "Last year"}</SelectItem>)}</SelectContent></Select>
          <Select value={type} onValueChange={setType}><SelectTrigger className="w-40"><SelectValue placeholder="Report Type" /></SelectTrigger><SelectContent>{reportTypes.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent></Select>
          <div className="flex gap-2"><Button variant="outline" className="flex items-center gap-2"><Download className="h-4 w-4" /> Export CSV</Button><Button variant="outline" className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Custom Range</Button></div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="rounded-lg border border-navy-200 bg-white p-6"><dt className="text-sm font-medium text-navy-500">Total Revenue</dt><dd className="mt-1 text-2xl font-bold text-navy-900">₦12.4M</dd></div>
        <div className="rounded-lg border border-navy-200 bg-white p-6"><dt className="text-sm font-medium text-navy-500">Total Orders</dt><dd className="mt-1 text-2xl font-bold text-navy-900">2,847</dd></div>
        <div className="rounded-lg border border-navy-200 bg-white p-6"><dt className="text-sm font-medium text-navy-500">Avg Order Value</dt><dd className="mt-1 text-2xl font-bold text-navy-900">₦4,356</dd></div>
        <div className="rounded-lg border border-navy-200 bg-white p-6"><dt className="text-sm font-medium text-navy-500">New Customers</dt><dd className="mt-1 text-2xl font-bold text-navy-900">589</dd></div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-lg border border-navy-200 bg-white p-6"><h2 className="text-lg font-semibold text-navy-900">Revenue Trend</h2><LineChart data={revenueSeries} height={280} className="mt-4" stroke="#16a34a" /></section>
        <section className="rounded-lg border border-navy-200 bg-white p-6"><h2 className="text-lg font-semibold text-navy-900">Orders Trend</h2><LineChart data={ordersSeries} height={280} className="mt-4" stroke="#0ea5e9" /></section>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-lg border border-navy-200 bg-white p-6"><h2 className="text-lg font-semibold text-navy-900">Order Status Distribution</h2><DonutChart data={statusDistribution} size={260} className="mt-4" /></section>
        <section className="rounded-lg border border-navy-200 bg-white p-6"><h2 className="text-lg font-semibold text-navy-900">Revenue by Category</h2><DonutChart data={categoryRevenue.map((c,i) => ({ label: c.label, value: c.value, color: ["#16a34a","#0ea5e9","#f59e0b","#ef4444","#8b5cf6","#64748b"][i] }))} size={260} className="mt-4" /></section>
      </div>

      <section className="rounded-lg border border-navy-200 bg-white p-6"><h2 className="text-lg font-semibold text-navy-900">Top Products</h2><div className="mt-4 space-y-3">
        {topProducts.map((p, i) => (
          <div key={p.name} className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-100 text-navy-600 font-semibold">{i+1}</span><div className="flex-1 min-w-0"><p className="font-medium text-navy-900 truncate">{p.name}</p><p className="text-sm text-navy-500">{p.category} · {p.unitsSold.toLocaleString()} units</p></div><span className="font-semibold text-navy-900">{formatNaira(p.revenue)}</span></div>
        ))}
      </div></section>

      <section className="rounded-lg border border-navy-200 bg-white p-6"><h2 className="text-lg font-semibold text-navy-900">Customer Growth</h2><BarChart data={customerGrowth} horizontal className="mt-4" /></section>

      <section className="rounded-lg border border-navy-200 bg-white p-6"><h2 className="text-lg font-semibold text-navy-900">Revenue by Area</h2><BarChart data={areasForAnalytics.map(a => ({ label: a.area, value: a.revenue }))} horizontal className="mt-4" /></section>
    </div>
  )
}
