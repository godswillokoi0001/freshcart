import React from "react"
import { useToast } from "@context/ToastContext"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@components/ui/Dialog"
import { brands } from "@data/categories"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Label } from "@components/ui/Label"

export function AdminBrandsPage() {
  const { success } = useToast()
  const [search, setSearch] = React.useState("")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<typeof brands[0] | null>(null)
  const [form, setForm] = React.useState({ name: "", logoUrl: "", status: "ACTIVE" })

  const filtered = React.useMemo(() => brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase())), [search])

  const handleCreate = () => { setEditing(null); setForm({ name: "", logoUrl: "", status: "ACTIVE" }); setCreateOpen(true) }
  const handleEdit = (b: typeof brands[0]) => { setEditing(b); setForm({ name: b.name, logoUrl: b.logoUrl || "", status: b.status }); setCreateOpen(true) }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-navy-900">Brand Management</h1><p className="mt-1 text-sm text-navy-500">{filtered.length} brand{filtered.length !== 1 ? "s" : ""}</p></div>
        <div className="flex flex-wrap gap-3"><div className="relative min-w-0 flex-1 sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search brands…" className="h-10 pl-9" /></div><Button onClick={handleCreate}><Plus className="h-4 w-4" /> Add Brand</Button></div>
      </div>

      <div className="rounded-lg border border-navy-200 bg-white overflow-hidden">
        <table className="w-full"><thead className="bg-navy-50"><tr className="text-left text-sm font-semibold text-navy-500 border-b border-navy-200"><th className="p-3 w-12">Logo</th><th className="p-3">Name</th><th className="p-3">Products</th><th className="p-3">Status</th><th className="p-3 w-32">Actions</th></tr></thead>
        <tbody className="divide-y divide-navy-100">
          {filtered.map(b => (
            <tr key={b.id} className="hover:bg-navy-50">
              <td className="p-3"><div className="h-10 w-10 rounded bg-navy-50 flex items-center justify-center text-lg">🏷️</div></td>
              <td className="p-3 font-medium text-navy-900">{b.name}</td>
              <td className="p-3 text-sm text-navy-500">{b.productCount}</td>
              <td className="p-3"><span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-success-50 text-success-600">{b.status}</span></td>
              <td className="p-3 flex items-center gap-2"><Button variant="ghost" size="icon" onClick={() => handleEdit(b)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-danger-600"><Trash2 className="h-4 w-4" /></Button></td>
            </tr>
          ))}
        </tbody></table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{editing ? "Edit Brand" : "Create Brand"}</DialogTitle></DialogHeader>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); setCreateOpen(false); setEditing(null); success("Brand saved", `"${form.name}" has been saved.`); }}>
          <div><Label htmlFor="name">Brand Name</Label><Input id="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
          <div><Label htmlFor="logoUrl">Logo URL (optional)</Label><Input id="logoUrl" value={form.logoUrl} onChange={e => setForm({...form, logoUrl: e.target.value})} placeholder="https://example.com/logo.png" /></div>
          <div><Label htmlFor="status">Status</Label><Select value={form.status} onValueChange={v => setForm({...form, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="HIDDEN">Hidden</SelectItem></SelectContent></Select></div>
          <DialogFooter><Button type="submit">Save</Button><Button type="button" variant="outline" onClick={() => { setCreateOpen(false); setEditing(null) }}>Cancel</Button></DialogFooter>
        </form></DialogContent>
      </Dialog>
    </div>
  )
}
