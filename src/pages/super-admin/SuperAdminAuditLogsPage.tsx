import React from "react"
import { Search, Filter, FileText, ChevronRight, AlertCircle, CheckCircle2, Clock, ChevronLeft, MoreHorizontal } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Badge } from "@components/ui/Badge"
import { auditLogs } from "@data/admin"
import { formatDateTime } from "@lib/format"
import { cn } from "@lib/utils"

const statuses = ["all", "SUCCESS", "FAILED"] as const

export function SuperAdminAuditLogsPage() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<typeof statuses[number]>("all")

  const filtered = React.useMemo(() => {
    let list = [...auditLogs]
    if (search) { const q = search.toLowerCase(); list = list.filter(a => a.action.toLowerCase().includes(q) || a.resource.toLowerCase().includes(q) || a.user.toLowerCase().includes(q)) }
    if (statusFilter !== "all") list = list.filter(a => a.status === statusFilter)
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [search, statusFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <p className="mt-1 text-sm text-navy-400">{filtered.length} log entries</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3"><div className="relative min-w-0 flex-1 sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs…" className="h-10 pl-9 bg-navy-900 border-navy-700" /></div><Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statuses[number])}><SelectTrigger className="w-36 bg-navy-900 border-navy-700"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All" : s}</SelectItem>)}</SelectContent></Select></div>
      </div>

      <div className="rounded-lg border border-navy-800 bg-navy-950 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead className="bg-navy-900/50">
              <tr className="text-left text-sm font-semibold text-navy-300 border-b border-navy-800">
                <th className="p-3">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Resource</th>
                <th className="p-3">Status</th>
                <th className="p-3 w-40">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-navy-900/50">
                  <td className="p-3 text-sm text-navy-300">{formatDateTime(a.timestamp)}</td>
                  <td className="p-3 text-sm text-white">{a.user}</td>
                  <td className="p-3 text-sm text-navy-300">{a.action}</td>
                  <td className="p-3 text-sm text-navy-300">{a.resource}</td>
                  <td className="p-3"><Badge variant={a.status === "SUCCESS" ? "success" : "destructive"}>{a.status}</Badge></td>
                  <td className="p-3 text-sm text-navy-400 max-w-xs truncate">{a.details || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
