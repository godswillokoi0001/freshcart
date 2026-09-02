import React from "react"
import { useToast } from "@context/ToastContext"
import { Link } from "react-router-dom"
import { Search, Plus, Edit, Trash2, ChevronRight, Image, Tag } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@components/ui/Dialog"
import { categories } from "@data/categories"
import { formatNaira } from "@lib/format"
import { cn } from "@lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Label } from "@components/ui/Label"

export function AdminCategoriesPage() {
  const { success } = useToast()
  const [search, setSearch] = React.useState("")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<typeof categories[0] | null>(null)
  const [form, setForm] = React.useState({ name: "", slug: "", description: "", status: "ACTIVE" })

  const filtered = React.useMemo(() => categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase())), [search])

  const handleCreate = () => { setEditing(null); setForm({ name: "", slug: "", description: "", status: "ACTIVE" }); setCreateOpen(true) }
  const handleEdit = (c: typeof categories[0]) => { setEditing(c); setForm({ name: c.name, slug: c.slug, description: c.description, status: c.status }); setCreateOpen(true) }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-navy-900">Category Management</h1><p className="mt-1 text-sm text-navy-500">{filtered.length} categor{filtered.length !== 1 ? "ies" : "y"}</p></div>
        <div className="flex flex-wrap gap-3"><div className="relative min-w-0 flex-1 sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories…" className="h-10 pl-9" /></div><Button onClick={handleCreate}><Plus className="h-4 w-4" /> Add Category</Button></div>
      </div>

      <div className="rounded-lg border border-navy-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-navy-50"><tr className="text-left text-sm font-semibold text-navy-500 border-b border-navy-200"><th className="p-3 w-12">Image</th><th className="p-3">Name</th><th className="p-3">Slug</th><th className="p-3">Products</th><th className="p-3">Status</th><th className="p-3 w-32">Actions</th></tr></thead>
          <tbody className="divide-y divide-navy-100">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-navy-50">
                <td className="p-3"><div className="h-10 w-10 rounded bg-navy-50 flex items-center justify-center text-lg">🛒</div></td>
                <td className="p-3 font-medium text-navy-900">{c.name}</td>
                <td className="p-3 text-sm text-navy-500 font-mono">{c.slug}</td>
                <td className="p-3 text-sm text-navy-500">{c.productCount}</td>
                <td className="p-3"><span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", c.status === "ACTIVE" ? "bg-success-50 text-success-600" : "bg-navy-100 text-navy-600")}>{c.status}</span></td>
                <td className="p-3 flex items-center gap-2"><Button variant="ghost" size="icon" onClick={() => handleEdit(c)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-danger-600"><Trash2 className="h-4 w-4" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{editing ? "Edit Category" : "Create Category"}</DialogTitle></DialogHeader>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); setCreateOpen(false); setEditing(null); success("Category saved", `"${form.name}" has been saved.`); }}>
          <div><Label htmlFor="name">Name</Label><Input id="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
          <div><Label htmlFor="slug">Slug</Label><Input id="slug" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="auto-generated" /></div>
          <div><Label htmlFor="description">Description</Label><textarea id="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full rounded-md border border-navy-200 p-2 text-sm focus:border-fresh-500" rows={2} /></div>
          <div><Label htmlFor="status">Status</Label><Select value={form.status} onValueChange={v => setForm({...form, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="HIDDEN">Hidden</SelectItem></SelectContent></Select></div>
          <DialogFooter><Button type="submit">Save</Button><Button type="button" variant="outline" onClick={() => { setCreateOpen(false); setEditing(null) }}>Cancel</Button></DialogFooter>
        </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}