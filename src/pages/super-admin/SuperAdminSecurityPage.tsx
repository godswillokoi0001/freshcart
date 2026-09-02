import React from "react"
import { AlertTriangle, Shield, User, AlertCircle, CheckCircle2, ChevronRight, Filter, Search } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Badge } from "@components/ui/Badge"
import { securityEvents, adminAccounts } from "@data/admin"
import { formatDateTime } from "@lib/format"
import { cn } from "@lib/utils"

const severities = ["all", "HIGH", "MEDIUM", "LOW"] as const

export function SuperAdminSecurityPage() {
  const [severityFilter, setSeverityFilter] = React.useState<typeof severities[number]>("all")
  const [search, setSearch] = React.useState("")

  const filtered = React.useMemo(() => {
    let list = [...securityEvents]
    if (search) { const q = search.toLowerCase(); list = list.filter(e => e.event.toLowerCase().includes(q) || e.user.toLowerCase().includes(q) || e.ipAddress.toLowerCase().includes(q)) }
    if (severityFilter !== "all") list = list.filter(e => e.severity === severityFilter)
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [search, severityFilter])

  const highCount = securityEvents.filter(e => e.severity === "HIGH").length
  const medCount = securityEvents.filter(e => e.severity === "MEDIUM").length
  const lowCount = securityEvents.filter(e => e.severity === "LOW").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Security Center</h1>
        <p className="mt-1 text-sm text-navy-400">Monitor and manage platform security events.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-red-900/30 bg-red-900/10 p-6"><dt className="text-sm font-medium text-red-400">High Severity</dt><dd className="mt-1 text-3xl font-bold text-red-400">{highCount}</dd></div>
        <div className="rounded-lg border border-yellow-900/30 bg-yellow-900/10 p-6"><dt className="text-sm font-medium text-yellow-400">Medium Severity</dt><dd className="mt-1 text-3xl font-bold text-yellow-400">{medCount}</dd></div>
        <div className="rounded-lg border border-green-900/30 bg-green-900/10 p-6"><dt className="text-sm font-medium text-green-400">Low Severity</dt><dd className="mt-1 text-3xl font-bold text-green-400">{lowCount}</dd></div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3"><div className="relative min-w-0 flex-1 sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…" className="h-10 pl-9 bg-navy-900 border-navy-700" /></div><Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as typeof severities[number])}><SelectTrigger className="w-36 bg-navy-900 border-navy-700"><SelectValue placeholder="Severity" /></SelectTrigger><SelectContent>{severities.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All" : s}</SelectItem>)}</SelectContent></Select></div>
      </div>

      <div className="space-y-3">
        {filtered.map(e => (
          <div key={e.id} className="rounded-lg border border-navy-800 bg-navy-950 p-4 hover:bg-navy-900/50">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", e.severity === "HIGH" ? "bg-red-900/30 text-red-400" : e.severity === "MEDIUM" ? "bg-yellow-900/30 text-yellow-400" : "bg-green-900/30 text-green-400")}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-white">{e.event}</p>
                  <p className="text-sm text-navy-400">{e.user} · {e.ipAddress}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={e.severity === "HIGH" ? "destructive" : e.severity === "MEDIUM" ? "warning" : "default"}>{e.severity}</Badge>
                <span className="text-xs text-navy-400">{formatDateTime(e.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-lg border border-navy-800 bg-navy-950 p-6">
        <h2 className="text-lg font-semibold text-white">Admin Security Status</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-navy-800 p-4"><dt className="text-sm text-navy-400">2FA Enabled</dt><dd className="mt-1 text-2xl font-bold text-green-400">{adminAccounts.filter(a => a.permissions.includes("twoFactor") || true).length} / {adminAccounts.length}</dd></div>
          <div className="rounded-lg border border-navy-800 p-4"><dt className="text-sm text-navy-400">Active Sessions</dt><dd className="mt-1 text-2xl font-bold text-white">24</dd></div>
          <div className="rounded-lg border border-navy-800 p-4"><dt className="text-sm text-navy-400">Failed Logins (24h)</dt><dd className="mt-1 text-2xl font-bold text-red-400">3</dd></div>
          <div className="rounded-lg border border-navy-800 p-4"><dt className="text-sm text-navy-400">Blocked IPs</dt><dd className="mt-1 text-2xl font-bold text-white">12</dd></div>
        </div>
      </section>
    </div>
  )
}
