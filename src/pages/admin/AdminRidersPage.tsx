import React from "react"
import { Search, Filter, User, ChevronRight, Truck, MapPin, Shield, MoreHorizontal } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Badge } from "@components/ui/Badge"
import { riders } from "@data/people"
import { RiderStatusBadge } from "@components/shared/StatusBadges"
import { formatNaira, formatDate } from "@lib/format"
import { cn } from "@lib/utils"

const statuses = ["all", "AVAILABLE", "ON_DELIVERY", "OFFLINE"] as const

export function AdminRidersPage() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<typeof statuses[number]>("all")

  const filtered = React.useMemo(() => {
    let list = [...riders]
    if (search) { const q = search.toLowerCase(); list = list.filter(r => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.vehicle.toLowerCase().includes(q)) }
    if (statusFilter !== "all") list = list.filter(r => r.status === statusFilter)
    return list.sort((a, b) => a.name.localeCompare(b.name))
  }, [search, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-navy-900">Rider Management</h1><p className="mt-1 text-sm text-navy-500">{filtered.length} rider{filtered.length !== 1 ? "s" : ""}</p></div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:items-center">
          <div className="relative w-full sm:w-60">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search riders…" className="h-10 pl-9 w-full" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All Status" : s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-navy-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead className="bg-navy-50">
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-navy-500 border-b border-navy-200">
                <th className="p-3.5">Rider</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5">Vehicle</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Deliveries</th>
                <th className="p-3.5 text-center">Rating</th>
                <th className="p-3.5">Week Earnings</th>
                <th className="p-3.5 w-16 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100 text-sm">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-navy-50/70 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fresh-100 text-fresh-700 font-bold text-xs">
                        {r.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <p className="font-semibold text-navy-900">{r.name}</p>
                    </div>
                  </td>
                  <td className="p-3.5 text-xs text-navy-500">
                    <div className="text-navy-700">{r.email}</div>
                    <div>{r.phone}</div>
                  </td>
                  <td className="p-3.5 text-navy-600 font-medium">{r.vehicle}</td>
                  <td className="p-3.5"><RiderStatusBadge status={r.status} /></td>
                  <td className="p-3.5 text-center font-semibold text-navy-800">{r.deliveriesCompleted}</td>
                  <td className="p-3.5 text-center text-amber-600 font-medium">{r.rating} ★</td>
                  <td className="p-3.5 font-bold text-navy-900">{formatNaira(r.weekEarnings)}</td>
                  <td className="p-3.5 text-right">
                    <Button variant="ghost" size="icon" className="text-fresh-700 hover:text-fresh-800"><ChevronRight className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-navy-500">No riders found</div>
          )}
        </div>
      </div>
    </div>
  )
}
