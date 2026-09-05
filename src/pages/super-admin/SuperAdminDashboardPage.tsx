import { StatCard } from "@components/shared/StatCard"
import { LineChart, DonutChart } from "@components/shared/Charts"
import { auditLogs, securityEvents, adminAccounts } from "@data/admin"
import { Shield, Users, AlertTriangle, FileText, CheckCircle2 } from "lucide-react"
import { cn } from "@lib/utils"

const stats = [
  { label: "Total Admins", value: adminAccounts.length.toString(), icon: Users, accent: "fresh" as const },
  { label: "Active Admins", value: adminAccounts.filter(a => a.status === "ACTIVE").length.toString(), icon: CheckCircle2, accent: "success" as const },
  { label: "Security Events (24h)", value: securityEvents.filter(e => new Date(e.timestamp) > new Date(Date.now() - 86400000)).length.toString(), icon: AlertTriangle, accent: "warning" as const },
  { label: "Audit Entries (7d)", value: auditLogs.filter(a => new Date(a.timestamp) > new Date(Date.now() - 7*86400000)).length.toString(), icon: FileText, accent: "info" as const },
]

const recentSecurity = securityEvents.slice(0, 5)
const recentAdminActions = auditLogs.slice(0, 5)

export function SuperAdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
        <p className="mt-1 text-sm text-navy-400">Platform administration and security overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => <StatCard key={s.label} {...s} dark />)}
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-lg border border-navy-800 bg-navy-950 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-white">Security Events (Last 24h)</h2>
            <div className="mt-4 space-y-3">
              {recentSecurity.map(e => (
                <div key={e.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-navy-800 hover:bg-navy-900 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-900/30 text-red-400">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white text-sm truncate">{e.event}</p>
                      <p className="text-xs text-navy-400 truncate">{e.user} · {e.ipAddress}</p>
                    </div>
                  </div>
                  <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full shrink-0", e.severity === "HIGH" ? "bg-red-900/30 text-red-400" : e.severity === "MEDIUM" ? "bg-yellow-900/30 text-yellow-400" : "bg-green-900/30 text-green-400")}>
                    {e.severity}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-navy-800 bg-navy-950 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-white">Recent Administrative Actions</h2>
            <div className="mt-4 space-y-3">
              {recentAdminActions.map(a => (
                <div key={a.id} className="p-3 rounded-lg border border-navy-800 hover:bg-navy-900 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-white text-sm truncate">{a.user} <span className="text-navy-400 font-normal">({a.role})</span></p>
                    <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full shrink-0", a.status === "SUCCESS" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400")}>
                      {a.status}
                    </span>
                  </div>
                  <p className="text-xs text-navy-300 mt-1 truncate">{a.action} on <span className="text-white font-mono">{a.resource}</span></p>
                  <p className="text-xs text-navy-500 mt-0.5">{new Date(a.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-navy-800 bg-navy-950 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-white">Admin Status</h2>
            <div className="mt-4 space-y-3">
              {adminAccounts.map(a => (
                <div key={a.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-navy-800">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fresh-900/30 text-fresh-400 font-semibold text-xs">
                      {a.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white text-sm truncate">{a.name}</p>
                      <p className="text-xs text-navy-400 truncate">{a.email}</p>
                    </div>
                  </div>
                  <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full shrink-0", a.status === "ACTIVE" ? "bg-green-900/30 text-green-400" : "bg-navy-700 text-navy-400")}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
