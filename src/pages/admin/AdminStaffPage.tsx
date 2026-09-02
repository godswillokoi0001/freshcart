import * as React from "react"
import { Link } from "react-router-dom"
import { Search, Plus, UserPlus, Edit, Trash2, ChevronRight, User, Shield, Mail, Phone, ChevronLeft, MoreHorizontal } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Badge } from "@components/ui/Badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@components/ui/Dialog"
import { staff } from "@data/people"
import { formatDate } from "@lib/format"
import { cn } from "@lib/utils"

const statuses = ["all", "ACTIVE", "INACTIVE"] as const
const roles = ["STAFF", "SUPERVISOR"] as const

export function AdminStaffPage() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<typeof statuses[number]>("all")
  const [roleFilter, setRoleFilter] = React.useState<typeof roles[number] | "all">("all")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<typeof staff[0] | null>(null)
  const [form, setForm] = React.useState({ name: "", email: "", role: "STAFF", status: "ACTIVE" })

  const filtered = React.useMemo(() => {
    let list = [...staff]
    if (search) { const q = search.toLowerCase(); list = list.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)) }
    if (statusFilter !== "all") list = list.filter(s => s.status === statusFilter)
    if (roleFilter !== "all") list = list.filter(s => s.role === roleFilter)
    return list.sort((a, b) => a.name.localeCompare(b.name))
  }, [search, statusFilter, roleFilter])

  const handleCreate = () => { setEditing(null); setForm({ name: "", email: "", role: "STAFF", status: "ACTIVE" }); setCreateOpen(true) }
  const handleEdit = (s: typeof staff[0]) => { setEditing(s); setForm({ name: s.name, email: s.email, role: s.role, status: s.status }); setCreateOpen(true) }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-navy-900">Staff Management</h1><p className="mt-1 text-sm text-navy-500">{filtered.length} staff member{filtered.length !== 1 ? "s" : ""}</p></div>
        <div className="flex flex-wrap gap-3"><div className="relative min-w-0 flex-1 sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…" className="h-10 pl-9" /></div><Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}><SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All" : s}</SelectItem>)}</SelectContent></Select><Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as typeof roleFilter)}><SelectTrigger className="w-36"><SelectValue placeholder="Role" /></SelectTrigger><SelectContent>{["all", ...roles].map(r => <SelectItem key={r} value={r}>{r === "all" ? "All Roles" : r}</SelectItem>)}</SelectContent></Select><Button onClick={handleCreate}><UserPlus className="h-4 w-4" /> Invite Staff</Button></div>
      </div>

      <div className="rounded-lg border border-navy-200 bg-white overflow-hidden">
        <table className="w-full"><thead className="bg-navy-50"><tr className="text-left text-sm font-semibold text-navy-500 border-b border-navy-200"><th className="p-3">Staff</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3 hidden md:table-cell">Last Active</th><th className="p-3">Orders Fulfilled</th><th className="p-3 w-32">Actions</th></tr></thead><tbody className="divide-y divide-navy-100">
          {filtered.map(s => (
            <tr key={s.id} className="hover:bg-navy-50">
              <td className="p-3"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-fresh-100 text-fresh-700 font-semibold">{s.name.split(" ").map(n => n[0]).join("")}</div><p className="font-medium text-navy-900">{s.name}</p></div></td>
              <td className="p-3 text-sm text-navy-500">{s.email}</td>
              <td className="p-3"><Badge variant="default">{s.role}</Badge></td>
              <td className="p-3"><Badge variant={s.status === "ACTIVE" ? "success" : "default"}>{s.status}</Badge></td>
              <td className="p-3 hidden md:table-cell text-sm text-navy-500">{s.lastActive}</td>
              <td className="p-3 text-sm text-navy-500">{s.ordersFulfilled}</td>
              <td className="p-3 flex items-center gap-2"><Button variant="ghost" size="icon" onClick={() => handleEdit(s)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-danger-600"><Trash2 className="h-4 w-4" /></Button></td>
            </tr>
          ))}
        </tbody></table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{editing ? "Edit Staff" : "Invite Staff"}</DialogTitle></DialogHeader>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); setCreateOpen(false); setEditing(null); success("Staff saved", `"${form.name}" has been saved.`); }}>
          <div><Label htmlFor="name">Full Name</Label><Input id="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
          <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="role">Role</Label><Select value={form.role} onValueChange={v => setForm({...form, role: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div><div><Label htmlFor="status">Status</Label><Select value={form.status} onValueChange={v => setForm({...form, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="INACTIVE">Inactive</SelectItem></SelectContent></Select></div></div>
          <DialogFooter><Button type="submit">{editing ? "Save Changes" : "Send Invite"}</Button><Button type="button" variant="outline" onClick={() => { setCreateOpen(false); setEditing(null) }}>Cancel</Button></DialogFooter>
        </form></DialogContent>
      </Dialog>
    </div>
  )
}

import { Label } from "@components/ui/Label"
