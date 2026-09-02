import React from "react"
import { Search, Filter, Bell, AlertCircle, Package, Truck, ChevronRight, Check, MoreHorizontal } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Badge } from "@components/ui/Badge"
import { notifications } from "@data/orders"
import { formatDateTime } from "@lib/format"
import { cn } from "@lib/utils"

const types = ["all", "ORDER", "DELIVERY", "PROMO", "ACCOUNT"] as const

export function AdminNotificationsPage() {
  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<typeof types[number]>("all")

  const filtered = React.useMemo(() => {
    let list = [...notifications]
    if (search) { const q = search.toLowerCase(); list = list.filter(n => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)) }
    if (typeFilter !== "all") list = list.filter(n => n.type === typeFilter)
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [search, typeFilter])

  const iconMap: Record<string, React.ReactNode> = { ORDER: <Package className="h-4 w-4" />, DELIVERY: <Truck className="h-4 w-4" />, PROMO: <Bell className="h-4 w-4" />, ACCOUNT: <AlertCircle className="h-4 w-4" /> }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-navy-900">Notifications</h1><p className="mt-1 text-sm text-navy-500">{filtered.length} notification{filtered.length !== 1 ? "s" : ""}</p></div>
        <div className="flex flex-wrap gap-3"><div className="relative min-w-0 flex-1 sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notifications…" className="h-10 pl-9" /></div><Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger><SelectContent>{types.map(t => <SelectItem key={t} value={t}>{t === "all" ? "All Types" : t}</SelectItem>)}</SelectContent></Select></div>
      </div>

      <div className="space-y-3">
        {filtered.map(n => (
          <div key={n.id} className={cn("flex items-start gap-3 rounded-lg p-4 transition-colors", n.read ? "bg-white" : "bg-fresh-50 ring-1 ring-fresh-500")}>
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", n.read ? "bg-navy-100 text-navy-400" : "bg-fresh-100 text-fresh-700")}>{iconMap[n.type]}</div>
            <div className="min-w-0 flex-1"><p className={cn("font-medium", n.read ? "text-navy-900" : "font-semibold text-navy-900")}>{n.title}</p><p className="mt-1 text-sm text-navy-600">{n.message}</p><p className="mt-1 text-xs text-navy-400">{formatDateTime(n.createdAt)} · {n.type}</p></div>
            {!n.read && <span className="flex h-2 w-2 shrink-0 mt-2 rounded-full bg-fresh-600" />}
          </div>
        ))}
      </div>
    </div>
  )
}
