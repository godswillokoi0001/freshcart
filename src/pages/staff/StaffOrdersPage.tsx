import * as React from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Search, ChevronRight, Filter, Package } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Input } from "@components/ui/Input"
import { EmptyState } from "@components/ui/EmptyState"
import { adminOrders } from "@data/admin-orders"
import { OrderStatusBadge } from "@components/shared/StatusBadges"
import { formatNaira, formatDate } from "@lib/format"
import { cn } from "@lib/utils"

const statuses = ["PENDING", "CONFIRMED", "PREPARING", "PACKED", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as const

export function StaffOrdersPage() {
  const [params, setParams] = useSearchParams()
  const statusFilter = params.get("status")
  const search = params.get("q") ?? ""
  const [searchInput, setSearchInput] = React.useState(search)

  const filtered = React.useMemo(() => {
    let list = [...adminOrders]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (o) => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q)
      )
    }
    if (statusFilter) list = list.filter((o) => o.status === statusFilter)
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [search, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Order Management</h1>
          <p className="mt-1 text-sm text-navy-500">{filtered.length} order{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setParams(new URLSearchParams(searchInput ? { q: searchInput } : {}))}
              placeholder="Search order # or customer…"
              className="h-10 pl-9 pr-3"
            />
          </div>
          <Select value={statusFilter ?? "all"} onValueChange={(v) => setParams(v === "all" ? new URLSearchParams() : new URLSearchParams({ status: v }))}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="No orders found" description="Try adjusting your filters or search terms." action={{ label: "Clear filters", onClick: () => setParams(new URLSearchParams()) }} />
      ) : (
        <div className="rounded-lg border border-navy-200 bg-white divide-y divide-navy-100 overflow-hidden">
          <div className="hidden px-4 py-3 font-medium text-sm text-navy-500 sm:grid grid-cols-[80px_1fr_1fr_80px_100px_100px_100px_100px] gap-4">
            <span>Order</span><span>Customer</span><span>Items</span><span>Amount</span><span>Payment</span><span>Status</span><span>Date</span><span></span>
          </div>
          {filtered.map((o) => (
            <Link key={o.id} to={`/staff/orders/${o.id}`} className="grid grid-cols-[80px_1fr_1fr_80px_100px_100px_100px_100px_100px] gap-4 p-4 hover:bg-navy-50">
              <span className="font-mono font-medium text-navy-900">{o.orderNumber}</span>
              <span className="text-sm text-navy-700">{o.customerName}</span>
              <span className="text-sm text-navy-500">{o.items.length} items</span>
              <span className="font-semibold text-navy-900">{formatNaira(o.total)}</span>
              <span className="text-sm text-navy-600">{o.paymentMethod}</span>
              <span><OrderStatusBadge status={o.status} /></span>
              <span className="text-sm text-navy-500">{formatDate(o.createdAt)}</span>
              <ChevronRight className="h-5 w-5 text-navy-300" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
