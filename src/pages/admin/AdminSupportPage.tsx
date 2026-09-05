import * as React from "react"
import { Link } from "react-router-dom"
import { Search, Filter, AlertCircle, ChevronRight, MessageSquare, User, Clock, ChevronLeft, MoreHorizontal } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Badge } from "@components/ui/Badge"
import { supportTickets } from "@data/people"
import { formatDateTime } from "@lib/format"
import { cn } from "@lib/utils"

const statuses = ["all", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const
const priorities = ["all", "HIGH", "MEDIUM", "LOW"] as const

export function AdminSupportPage() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<typeof statuses[number]>("all")
  const [priorityFilter, setPriorityFilter] = React.useState<typeof priorities[number]>("all")

  const filtered = React.useMemo(() => {
    let list = [...supportTickets]
    if (search) { const q = search.toLowerCase(); list = list.filter(t => t.subject.toLowerCase().includes(q) || t.customer.toLowerCase().includes(q)) }
    if (statusFilter !== "all") list = list.filter(t => t.status === statusFilter)
    if (priorityFilter !== "all") list = list.filter(t => t.priority === priorityFilter)
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [search, statusFilter, priorityFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-navy-900">Support Tickets</h1><p className="mt-1 text-sm text-navy-500">{filtered.length} ticket{filtered.length !== 1 ? "s" : ""}</p></div>
        <div className="flex flex-wrap gap-3"><div className="relative min-w-0 flex-1 sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets…" className="h-10 pl-9" /></div><Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}><SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All" : s.replace("_", " ")}</SelectItem>)}</SelectContent></Select><Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as typeof priorityFilter)}><SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger><SelectContent>{priorities.map(p => <SelectItem key={p} value={p}>{p === "all" ? "All" : p}</SelectItem>)}</SelectContent></Select></div>
      </div>

      <div className="rounded-lg border border-navy-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-navy-50">
              <tr className="text-left text-sm font-semibold text-navy-500 border-b border-navy-200">
                <th className="p-3">Subject</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Category</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
                <th className="p-3">Last Reply</th>
                <th className="p-3 w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-navy-50">
                  <td className="p-3"><Link to="#" className="font-medium text-navy-900 hover:text-fresh-700">{t.subject}</Link></td>
                  <td className="p-3 text-sm text-navy-500">{t.customer}</td>
                  <td className="p-3 text-sm text-navy-500">{t.category}</td>
                  <td className="p-3"><Badge variant={t.priority === "HIGH" ? "destructive" : t.priority === "MEDIUM" ? "warning" : "default"}>{t.priority}</Badge></td>
                  <td className="p-3"><Badge variant={t.status === "OPEN" ? "info" : t.status === "IN_PROGRESS" ? "warning" : t.status === "RESOLVED" ? "success" : "default"}>{t.status.replace("_", " ")}</Badge></td>
                  <td className="p-3 text-sm text-navy-500">{formatDateTime(t.createdAt)}</td>
                  <td className="p-3 text-sm text-navy-500">{formatDateTime(t.lastReply)}</td>
                  <td className="p-3"><Link to="#" className="text-fresh-700 hover:underline">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
