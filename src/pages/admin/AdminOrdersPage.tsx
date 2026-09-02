import * as React from "react"
import { Link } from "react-router-dom"
import { Search, Filter, ChevronRight, Package, ChevronLeft } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Input } from "@components/ui/Input"
import { Badge } from "@components/ui/Badge"
import { adminOrders } from "@data/admin-orders"
import { formatNaira, formatDate } from "@lib/format"
import { OrderStatusBadge, PaymentStatusBadge } from "@components/shared/StatusBadges"
import { cn } from "@lib/utils"

const statuses = ["all", "PENDING", "CONFIRMED", "PREPARING", "PACKED", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as const
const paymentStatuses = ["all", "PAID", "UNPAID", "PENDING", "REFUNDED"] as const

export function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = React.useState<typeof statuses[number]>("all")
  const [paymentFilter, setPaymentFilter] = React.useState<typeof paymentStatuses[number]>("all")
  const [search, setSearch] = React.useState("")

  const filtered = React.useMemo(() => {
    let list = [...adminOrders]
    if (search) { const q = search.toLowerCase(); list = list.filter(o => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q)) }
    if (statusFilter !== "all") list = list.filter(o => o.status === statusFilter)
    if (paymentFilter !== "all") list = list.filter(o => o.paymentStatus === paymentFilter)
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [search, statusFilter, paymentFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Order Management</h1>
          <p className="mt-1 text-sm text-navy-500">{filtered.length} order{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-0 flex-1 sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order # or customer…" className="h-10 pl-9" /></div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}><SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s.replace("_", " ")}</SelectItem>)}</SelectContent></Select>
          <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as typeof paymentFilter)}><SelectTrigger className="w-36"><SelectValue placeholder="Payment" /></SelectTrigger><SelectContent>{paymentStatuses.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All" : s}</SelectItem>)}</SelectContent></Select>
        </div>
      </div>

      <div className="rounded-lg border border-navy-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-navy-50"><tr className="text-left text-sm font-semibold text-navy-500 border-b border-navy-200">
            <th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Items</th><th className="p-3">Amount</th><th className="p-3">Payment</th><th className="p-3">Status</th><th className="p-3">Date</th><th className="p-3 w-16"></th>
          </tr></thead>
          <tbody className="divide-y divide-navy-100">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-navy-50">
                <td className="p-3 font-mono font-medium text-navy-900">{o.orderNumber}</td>
                <td className="p-3 text-sm text-navy-700">{o.customerName}</td>
                <td className="p-3 text-sm text-navy-500">{o.items.length} items</td>
                <td className="p-3 font-semibold text-navy-900">{formatNaira(o.total)}</td>
                <td className="p-3"><PaymentStatusBadge status={o.paymentStatus} /></td>
                <td className="p-3"><OrderStatusBadge status={o.status} /></td>
                <td className="p-3 text-sm text-navy-500">{formatDate(o.createdAt)}</td>
                <td className="p-3"><Link to={`/admin/orders/${o.id}`} className="text-fresh-700 hover:underline">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <tbody><tr><td colSpan={8} className="p-8 text-center text-navy-500">No orders found</td></tr></tbody>}
      </div>
    </div>
  )
}
