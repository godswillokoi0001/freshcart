import * as React from "react"
import { Link } from "react-router-dom"
import { Package, ChevronRight } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Badge } from "@components/ui/Badge"
import { deliveries } from "@data/people"
import { DeliveryStatusBadge } from "@components/shared/StatusBadges"
import { formatNaira } from "@lib/format"

const statuses = ["all", "ASSIGNED", "ACCEPTED", "GO_TO_STORE", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"] as const

export function RiderDeliveriesPage() {
  const [statusFilter, setStatusFilter] = React.useState<typeof statuses[number]>("all")
  const myDeliveries = deliveries.filter((d) => d.riderId === "rider-1" || d.status === "UNASSIGNED")

  const filtered = React.useMemo(() => {
    let list = [...myDeliveries]
    if (statusFilter !== "all") list = list.filter((d) => d.status === statusFilter)
    return list.sort((a, b) => (a.status === "UNASSIGNED" ? -1 : 1))
  }, [statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">My Deliveries</h1>
          <p className="mt-1 text-sm text-navy-500">{filtered.length} deliver{filtered.length !== 1 ? "ies" : "y"}</p>
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {statuses.slice(1).map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-navy-200 bg-white p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-navy-300" />
            <p className="mt-2 font-medium text-navy-900">No deliveries found</p>
            <p className="mt-1 text-sm text-navy-500">Try adjusting your filters.</p>
          </div>
        ) : (
          filtered.map((d) => (
            <Link key={d.id} to={`/rider/deliveries/${d.id}`} className="block rounded-lg border border-navy-200 bg-white p-4 shadow-sm hover:border-navy-300">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-fresh-50">
                    <Package className="h-5 w-5 text-fresh-700" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-navy-900 truncate">{d.orderId}</p>
                      <DeliveryStatusBadge status={d.status} />
                    </div>
                    <p className="mt-1 text-sm text-navy-500">{d.customerName} · {d.area}</p>
                    <p className="text-sm text-navy-500">{d.itemsCount} items · {formatNaira(d.deliveryFee)}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-navy-300" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
