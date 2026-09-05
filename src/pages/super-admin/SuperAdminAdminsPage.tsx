import React from "react"
import { useToast } from "@context/ToastContext"
import { Search, Plus, UserPlus, Edit, Trash2, Shield, ChevronRight, User, Mail, ChevronLeft } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Label } from "@components/ui/Label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Badge } from "@components/ui/Badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@components/ui/Dialog"
import { adminAccounts, permissionMatrix } from "@data/admin"
import { formatDate } from "@lib/format"
import { cn } from "@lib/utils"

const statuses = ["all", "ACTIVE", "INACTIVE"] as const

export function SuperAdminAdminsPage() {
  const { success } = useToast()
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<typeof statuses[number]>("all")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<typeof adminAccounts[0] | null>(null)
  const [form, setForm] = React.useState({ name: "", email: "", role: "ADMIN", status: "ACTIVE" })

  const filtered = React.useMemo(() => {
    let list = [...adminAccounts]
    if (search) { const q = search.toLowerCase(); list = list.filter(a => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)) }
    if (statusFilter !== "all") list = list.filter(a => a.status === statusFilter)
    return list.sort((a, b) => a.name.localeCompare(b.name))
  }, [search, statusFilter])

  const handleCreate = () => { setEditing(null); setForm({ name: "", email: "", role: "ADMIN", status: "ACTIVE" }); setCreateOpen(true) }
  const handleEdit = (a: typeof adminAccounts[0]) => { setEditing(a); setForm({ name: a.name, email: a.email, role: a.role, status: a.status }); setCreateOpen(true) }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-white">Admin Management</h1><p className="mt-1 text-sm text-navy-400">{filtered.length} admin{filtered.length !== 1 ? "s" : ""}</p></div>
        <div className="flex flex-wrap gap-3"><div className="relative min-w-0 flex-1 sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search admins…" className="h-10 pl-9 bg-navy-900 border-navy-700" /></div><Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statuses[number])}><SelectTrigger className="w-32 bg-navy-900 border-navy-700"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All" : s}</SelectItem>)}</SelectContent></Select><Button onClick={handleCreate}><UserPlus className="h-4 w-4" /> Invite Admin</Button></div>
      </div>

      <div className="rounded-lg border border-navy-800 bg-navy-950 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead className="bg-navy-900/50">
              <tr className="text-left text-sm font-semibold text-navy-300 border-b border-navy-800">
                <th className="p-3">Admin</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 hidden md:table-cell">Last Active</th>
                <th className="p-3 hidden md:table-cell">Created</th>
                <th className="p-3 w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-navy-900/50">
                  <td className="p-3"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-fresh-900/30 text-fresh-400 font-semibold">{a.name.split(" ").map(n => n[0]).join("")}</div><p className="font-medium text-white">{a.name}</p></div></td>
                  <td className="p-3 text-sm text-navy-400">{a.email}</td>
                  <td className="p-3"><Badge variant="default">{a.role}</Badge></td>
                  <td className="p-3"><Badge variant={a.status === "ACTIVE" ? "success" : "default"}>{a.status}</Badge></td>
                  <td className="p-3 hidden md:table-cell text-sm text-navy-400">{a.lastActive}</td>
                  <td className="p-3 hidden md:table-cell text-sm text-navy-400">{formatDate(a.createdAt)}</td>
                  <td className="p-3 flex items-center gap-2"><Button variant="ghost" size="icon" onClick={() => handleEdit(a)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-red-400"><Trash2 className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md bg-navy-950 border-navy-800"><DialogHeader><DialogTitle className="text-white">{editing ? "Edit Admin" : "Invite Admin"}</DialogTitle></DialogHeader>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); setCreateOpen(false); setEditing(null); success("Admin saved", `"${form.name}" has been saved.`); }}>
          <div><Label htmlFor="name">Full Name</Label><Input id="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="bg-navy-900 border-navy-700" /></div>
          <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="bg-navy-900 border-navy-700" /></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="role">Role</Label><Select value={form.role} onValueChange={v => setForm({...form, role: v})}><SelectTrigger className="bg-navy-900 border-navy-700"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ADMIN">Admin</SelectItem><SelectItem value="SUPER_ADMIN">Super Admin</SelectItem></SelectContent></Select></div><div><Label htmlFor="status">Status</Label><Select value={form.status} onValueChange={v => setForm({...form, status: v})}><SelectTrigger className="bg-navy-900 border-navy-700"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="INACTIVE">Inactive</SelectItem></SelectContent></Select></div></div>
          <DialogFooter><Button type="submit">{editing ? "Save Changes" : "Send Invite"}</Button><Button type="button" variant="outline" onClick={() => { setCreateOpen(false); setEditing(null) }}>Cancel</Button></DialogFooter>
        </form></DialogContent>
      </Dialog>
    </div>
  )
}
