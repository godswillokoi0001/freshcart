import React from "react"
import { useToast } from "@context/ToastContext"
import { Link } from "react-router-dom"
import { Search, Filter, Truck, MapPin, Clock, ChevronRight, User, AlertCircle, CheckCircle2, Package, ChevronLeft, MoreHorizontal } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Badge } from "@components/ui/Badge"
import { deliveries, availableRiders } from "@data/people"
import { DeliveryStatusBadge, RiderStatusBadge } from "@components/shared/StatusBadges"
import { formatNaira, formatDateTime } from "@lib/format"
import { cn } from "@lib/utils"

const statuses = ["all", "UNASSIGNED", "ASSIGNED", "ACCEPTED", "GO_TO_STORE", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"] as const

export function AdminDeliveriesPage() {
  const { success } = useToast()
  const [statusFilter, setStatusFilter] = React.useState<typeof statuses[number]>("all")
  const [search, setSearch] = React.useState("")

  const filtered = React.useMemo(() => {
    let list = [...deliveries]
    if (search) { const q = search.toLowerCase(); list = list.filter(d => d.orderId.toLowerCase().includes(q) || d.customerName.toLowerCase().includes(q)) }
    if (statusFilter !== "all") list = list.filter(d => d.status === statusFilter)
    return list.sort((a, b) => {
      const order = ["UNASSIGNED", "ASSIGNED", "ACCEPTED", "GO_TO_STORE", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"]
      return order.indexOf(a.status) - order.indexOf(b.status)
    })
  }, [search, statusFilter])

  const assignRider = (deliveryId: string, riderId: string) => {
    success("Rider assigned", `Rider assigned to delivery ${deliveryId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-navy-900">Delivery Operations</h1><p className="mt-1 text-sm text-navy-500">{filtered.length} delivery{filtered.length !== 1 ? "s" : ""}</p></div>
        <div className="flex flex-wrap gap-3"><div className="relative min-w-0 flex-1 sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order # or customer…" className="h-10 pl-9" /></div><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All" : s.replace("_", " ")}</SelectItem>)}</SelectContent></Select></div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <section><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold text-navy-900">Pending Assignments</h2></div>
            <div className="rounded-lg border border-navy-200 bg-white divide-y divide-navy-100">
              {filtered.filter(d => d.status === "UNASSIGNED").map(d => (
                <div key={d.id} className="flex items-center justify-between p-4 hover:bg-navy-50">
                  <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50"><Truck className="h-5 w-5 text-navy-400" /></div><div><p className="font-medium text-navy-900">{d.orderId}</p><p className="text-sm text-navy-500">{d.customerName} · {d.area} · {d.itemsCount} items</p></div></div>
                  <div className="flex items-center gap-2"><span className="text-sm font-medium text-navy-900">{formatNaira(d.deliveryFee)}</span><Badge variant="destructive">UNASSIGNED</Badge></div>
                </div>
              ))}
            </div>
          </section>

          <section><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold text-navy-900">Active Deliveries</h2></div>
            <div className="rounded-lg border border-navy-200 bg-white divide-y divide-navy-100">
              {filtered.filter(d => d.status !== "UNASSIGNED" && d.status !== "DELIVERED").map(d => (
                <Link key={d.id} to="#" className="block p-4 hover:bg-navy-50">
                  <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3 flex-1 min-w-0"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fresh-50"><Package className="h-5 w-5 text-fresh-700" /></div><div className="min-w-0"><p className="font-medium text-navy-900 truncate">{d.orderId}</p><p className="text-sm text-navy-500">{d.customerName} · {d.area} · {d.itemsCount} items</p></div></div><div className="flex items-center gap-3"><DeliveryStatusBadge status={d.status} /><ChevronRight className="h-5 w-5 text-navy-300" /></div></div>
                </Link>
              ))}
            </div>
          </section>

          <section><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold text-navy-900">Completed Today</h2></div>
            <div className="rounded-lg border border-navy-200 bg-white divide-y divide-navy-100">
              {filtered.filter(d => d.status === "DELIVERED").slice(0, 10).map(d => (
                <div key={d.id} className="flex items-center justify-between p-4 hover:bg-navy-50">
                  <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50"><CheckCircle2 className="h-5 w-5 text-success-600" /></div><div><p className="font-medium text-navy-900">{d.orderId}</p><p className="text-sm text-navy-500">{d.customerName} · {d.area} · {formatNaira(d.deliveryFee)}</p></div></div><Badge variant="success">DELIVERED</Badge></div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-lg border border-navy-200 bg-white p-6"><h2 className="text-lg font-semibold text-navy-900">Available Riders</h2>
            <div className="mt-4 space-y-2">
              {availableRiders.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-navy-100 hover:bg-navy-50">
                  <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-fresh-100 text-fresh-700 font-semibold text-sm">{r.name.split(" ").map(n => n[0]).join("")}</div><div><p className="font-medium text-navy-900">{r.name}</p><p className="text-xs text-navy-500">{r.vehicle}</p></div></div>
                  <RiderStatusBadge status={r.status} />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-navy-200 bg-white p-6"><h2 className="text-lg font-semibold text-navy-900">Quick Assign</h2>
            <p className="mt-1 text-sm text-navy-500">Select a delivery and a rider, then click Assign.</p>
            <div className="mt-4 space-y-3">
              <Select><SelectTrigger className="w-full"><SelectValue placeholder="Select unassigned delivery" /></SelectTrigger><SelectContent>{filtered.filter(d => d.status === "UNASSIGNED").map(d => <SelectItem key={d.id} value={d.id}>{d.orderId} — {d.customerName}</SelectItem>)}</SelectContent></Select>
              <Select><SelectTrigger className="w-full"><SelectValue placeholder="Select available rider" /></SelectTrigger><SelectContent>{availableRiders.map(r => <SelectItem key={r.id} value={r.id}>{r.name} ({r.vehicle})</SelectItem>)}</SelectContent></Select>
              <Button className="w-full" onClick={() => assignRider("FC-10236", "rider-1")}>Assign Rider</Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
