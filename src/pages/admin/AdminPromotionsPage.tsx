import React from "react"
import { Search, Plus, Filter, Edit, Trash2, Tag, Calendar, Image, Badge } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@components/ui/Dialog"
import { promotions } from "@data/admin"
import { formatDate } from "@lib/format"
import { Label } from "@components/ui/Label"
import { Badge as BadgeUI } from "@components/ui/Badge"

const types = ["all", "DISCOUNT", "BANNER", "BUNDLE"] as const
const statuses = ["all", "ACTIVE", "SCHEDULED", "ENDED"] as const

export function AdminPromotionsPage() {
  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<typeof types[number]>("all")
  const [statusFilter, setStatusFilter] = React.useState<typeof statuses[number]>("all")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<typeof promotions[0] | null>(null)
  const [form, setForm] = React.useState({ title: "", description: "", type: "DISCOUNT", status: "ACTIVE", startDate: new Date().toISOString().slice(0,16), endDate: new Date(Date.now() + 30*86400000).toISOString().slice(0,16), bannerUrl: undefined })

  const filtered = React.useMemo(() => {
    let list = [...promotions]
    if (search) { const q = search.toLowerCase(); list = list.filter(p => p.title.toLowerCase().includes(q)) }
    if (typeFilter !== "all") list = list.filter(p => p.type === typeFilter)
    if (statusFilter !== "all") list = list.filter(p => p.status === statusFilter)
    return list.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  }, [search, typeFilter, statusFilter])

  const handleCreate = () => { setEditing(null); setForm({ title: "", description: "", type: "DISCOUNT", status: "ACTIVE", startDate: new Date().toISOString().slice(0,16), endDate: new Date(Date.now() + 30*86400000).toISOString().slice(0,16), bannerUrl: undefined }); setCreateOpen(true) }
  const handleEdit = (p: typeof promotions[0]) => { setEditing(p); setForm({ ...p, startDate: p.startDate.slice(0,16), endDate: p.endDate.slice(0,16), bannerUrl: p.bannerUrl ?? undefined }); setCreateOpen(true) }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-navy-900">Promotions</h1><p className="mt-1 text-sm text-navy-500">{filtered.length} promotion{filtered.length !== 1 ? "s" : ""}</p></div>
        <div className="flex flex-wrap gap-3"><div className="relative min-w-0 flex-1 sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search promotions…" className="h-10 pl-9" /></div><Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger><SelectContent>{types.map(t => <SelectItem key={t} value={t}>{t === "all" ? "All" : t}</SelectItem>)}</SelectContent></Select><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All" : s}</SelectItem>)}</SelectContent></Select><Button onClick={handleCreate}><Plus className="h-4 w-4" /> Create Promotion</Button></div>
      </div>

      <div className="rounded-lg border border-navy-200 bg-white overflow-hidden">
        <table className="w-full"><thead className="bg-navy-50"><tr className="text-left text-sm font-semibold text-navy-500 border-b border-navy-200"><th className="p-3 w-16">Banner</th><th className="p-3">Title</th><th className="p-3">Type</th><th className="p-3">Status</th><th className="p-3">Period</th><th className="p-3 w-32">Actions</th></tr></thead><tbody className="divide-y divide-navy-100">
          {filtered.map(p => (
            <tr key={p.id} className="hover:bg-navy-50">
              <td className="p-3"><div className="h-10 w-16 rounded bg-navy-50 flex items-center justify-center text-lg">📢</div></td>
              <td className="p-3 font-medium text-navy-900">{p.title}</td>
              <td className="p-3"><BadgeUI variant="default">{p.type}</BadgeUI></td>
              <td className="p-3"><BadgeUI variant={p.status === "ACTIVE" ? "success" : p.status === "SCHEDULED" ? "info" : "default"}>{p.status}</BadgeUI></td>
              <td className="p-3 text-sm text-navy-500">{formatDate(p.startDate)} – {formatDate(p.endDate)}</td>
              <td className="p-3 flex items-center gap-2"><Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-danger-600"><Trash2 className="h-4 w-4" /></Button></td>
            </tr>
          ))}
        </tbody></table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{editing ? "Edit Promotion" : "Create Promotion"}</DialogTitle></DialogHeader>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); alert("Saved (demo)"); setCreateOpen(false); setEditing(null) }}>
          <div><Label htmlFor="title">Title</Label><Input id="title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
          <div><Label htmlFor="description">Description</Label><textarea id="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full rounded-md border border-navy-200 p-2 text-sm focus:border-fresh-500" rows={2} /></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="type">Type</Label><Select value={form.type} onValueChange={v => setForm({...form, type: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{types.filter(t => t !== "all").map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div><div><Label htmlFor="status">Status</Label><Select value={form.status} onValueChange={v => setForm({...form, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statuses.filter(s => s !== "all").map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="startDate">Start Date</Label><Input id="startDate" type="datetime-local" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required /></div><div><Label htmlFor="endDate">End Date</Label><Input id="endDate" type="datetime-local" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required /></div></div>
          <div><Label htmlFor="bannerUrl">Banner Image URL (optional)</Label><Input id="bannerUrl" value={form.bannerUrl} onChange={e => setForm({...form, bannerUrl: e.target.value})} placeholder="https://example.com/banner.jpg" /></div>
          <DialogFooter><Button type="submit">Save</Button><Button type="button" variant="outline" onClick={() => { setCreateOpen(false); setEditing(null) }}>Cancel</Button></DialogFooter>
        </form></DialogContent>
      </Dialog>
    </div>
  )
}
