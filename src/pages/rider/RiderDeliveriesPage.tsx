import * as React from "react"
import { Link } from "react-router-dom"
import { Package, ChevronRight, MapPin, Clock, Phone, AlertCircle, Bike } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { DeliveryStatusBadge } from "@components/shared/StatusBadges"
import { useOrders } from "@context/OrdersContext"
import { useAuth } from "@context/AuthContext"
import { formatNaira } from "@lib/format"
import type { Delivery } from "@app-types/index"

const statuses = ["all", "UNASSIGNED", "ASSIGNED", "ACCEPTED", "GO_TO_STORE", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"] as const

export function RiderDeliveriesPage() {
  const { orders } = useOrders()
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = React.useState<typeof statuses[number]>("all")

  // Generate dynamic deliveries synchronized with OrdersContext
  const dynamicDeliveries: Delivery[] = React.useMemo(() => {
    return orders
      .filter((o) => o.status !== "CANCELLED")
      .map((o) => {
        let deliveryStatus: Delivery["status"] = "UNASSIGNED"
        if (o.status === "DELIVERED") deliveryStatus = "DELIVERED"
        else if (o.status === "OUT_FOR_DELIVERY") deliveryStatus = "OUT_FOR_DELIVERY"
        else if (o.status === "READY_FOR_PICKUP") deliveryStatus = "PICKED_UP"
        else if (o.status === "PACKED") deliveryStatus = "GO_TO_STORE"
        else if (o.riderId || o.riderName) deliveryStatus = "ASSIGNED"

        const addr = `${o.address.line1}${o.address.line2 ? `, ${o.address.line2}` : ""}, ${o.address.city}`

        return {
          id: `del-${o.id}`,
          orderId: o.orderNumber,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          address: addr,
          area: o.address.city,
          itemsCount: o.items.reduce((s, i) => s + i.quantity, 0),
          deliveryFee: o.deliveryFee || 1500,
          status: deliveryStatus,
          assignedAt: o.createdAt,
          deliveryNotes: o.deliveryNotes || "Handle with care, fresh groceries.",
          riderId: o.riderId ?? "rider-1",
        }
      })
  }, [orders])

  const filtered = React.useMemo(() => {
    let list = [...dynamicDeliveries]
    if (statusFilter !== "all") list = list.filter((d) => d.status === statusFilter)
    return list.sort((a, b) => (a.status === "OUT_FOR_DELIVERY" ? -1 : 1))
  }, [dynamicDeliveries, statusFilter])

  const activeCount = dynamicDeliveries.filter((d) => d.status !== "DELIVERED").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Rider Delivery Dispatch</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {activeCount} active assigned trip{activeCount !== 1 ? "s" : ""} in your queue
          </p>
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Filter trips" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trips</SelectItem>
            <SelectItem value="ASSIGNED">Assigned</SelectItem>
            <SelectItem value="GO_TO_STORE">Go To Store</SelectItem>
            <SelectItem value="PICKED_UP">Picked Up</SelectItem>
            <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-xs">
            <Bike className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-3 font-bold text-slate-900">No deliveries in this stage</p>
            <p className="mt-1 text-xs text-slate-500">New dispatch orders will appear automatically as staff pack them.</p>
          </div>
        ) : (
          filtered.map((d) => (
            <Link
              key={d.id}
              to={`/rider/deliveries/${d.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-emerald-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                    <Bike className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-900">{d.orderId}</span>
                      <DeliveryStatusBadge status={d.status} />
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-700 truncate">
                      {d.customerName} · <span className="font-normal text-slate-500">{d.address}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {d.itemsCount} items · Trip payout: <span className="font-bold text-slate-700">{formatNaira(d.deliveryFee)}</span>
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 shrink-0 self-center" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
