import * as React from "react"
import { Link } from "react-router-dom"
import { Search, Filter, User, Mail, MapPin, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Badge } from "@components/ui/Badge"
import { customers } from "@data/admin"
import { formatNaira, formatDate } from "@lib/format"
import { cn } from "@lib/utils"

const statuses = ["all", "ACTIVE", "INACTIVE", "SUSPENDED"] as const

export function AdminCustomersPage() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<typeof statuses[number]>("all")

  const filtered = React.useMemo(() => {
    let list = [...customers]
    if (search) { const q = search.toLowerCase(); list = list.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q)) }
    if (statusFilter !== "all") list = list.filter(c => c.status === statusFilter)
    return list.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
  }, [search, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Customer Management</h1>
          <p className="mt-1 text-sm text-navy-500">{filtered.length} customer{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone…" className="h-10 pl-9 w-full" />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
            <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-navy-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px]">
            <thead className="bg-navy-50">
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-navy-500 border-b border-navy-200">
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5">Orders</th>
                <th className="p-3.5">Total Spent</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Joined</th>
                <th className="p-3.5 w-16 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100 text-sm">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-navy-50/70 transition-colors">
                  <td className="p-3.5">
                    <Link to={`/admin/customers/${c.id}`} className="font-semibold text-navy-900 hover:text-fresh-700 transition-colors">
                      {c.name}
                    </Link>
                  </td>
                  <td className="p-3.5 text-xs text-navy-500">
                    <div className="text-navy-700">{c.email}</div>
                    <div>{c.phone}</div>
                  </td>
                  <td className="p-3.5 text-navy-600">{c.ordersCount}</td>
                  <td className="p-3.5 font-bold text-navy-900">{formatNaira(c.totalSpent)}</td>
                  <td className="p-3.5"><Badge variant={c.status === "ACTIVE" ? "success" : c.status === "SUSPENDED" ? "destructive" : "default"}>{c.status}</Badge></td>
                  <td className="p-3.5 text-xs text-navy-500">{formatDate(c.joinedAt)}</td>
                  <td className="p-3.5 text-right">
                    <Link to={`/admin/customers/${c.id}`} className="text-xs font-semibold text-fresh-700 hover:text-fresh-800 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-navy-500">No customers found</div>
          )}
        </div>
      </div>
    </div>
  )
}
