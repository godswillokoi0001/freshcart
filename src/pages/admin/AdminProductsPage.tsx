import * as React from "react"
import { useToast } from "@context/ToastContext"
import { Link, useSearchParams } from "react-router-dom"
import { Search, Plus, Filter, ChevronRight, ChevronLeft, Edit, Trash2, Package, Image } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Input } from "@components/ui/Input"
import { Badge } from "@components/ui/Badge"
import { Label } from "@components/ui/Label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@components/ui/Dialog"
import { products } from "@data/products"
import { categories } from "@data/categories"
import { brands } from "@data/categories"
import { formatNaira } from "@lib/format"
import { StockStatusBadge } from "@components/shared/StatusBadges"
import { cn } from "@lib/utils"

export function AdminProductsPage() {
  const { success } = useToast()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | "ACTIVE" | "ARCHIVED">("all")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<string | null>(null)
  const [form, setForm] = React.useState({ name: "", categoryId: "", brand: "", price: 0, compareAtPrice: 0, sku: "", stock: 0, unit: "", description: "", status: "ACTIVE" })

  const filtered = React.useMemo(() => {
    let list = [...products]
    if (search) { const q = search.toLowerCase(); list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) }
    if (statusFilter !== "all") list = list.filter(p => p.status === statusFilter)
    if (categoryFilter !== "all") list = list.filter(p => p.categoryId === categoryFilter)
    return list.sort((a, b) => a.name.localeCompare(b.name))
  }, [search, statusFilter, categoryFilter])

  const handleCreate = () => { setForm({ name: "", categoryId: "", brand: "", price: 0, compareAtPrice: 0, sku: "", stock: 0, unit: "", description: "", status: "ACTIVE" }); setCreateOpen(true) }
  const handleEdit = (p: typeof products[0]) => { setEditing(p.id); setForm({ name: p.name, categoryId: p.categoryId, brand: p.brand, price: p.price, compareAtPrice: p.compareAtPrice || 0, sku: p.sku, stock: p.stock, unit: p.unit, description: p.description, status: p.status }); setCreateOpen(true) }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Product Management</h1>
          <p className="mt-1 text-sm text-navy-500">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-0 flex-1 sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or SKU…" className="h-10 pl-9" /></div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}><SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="ARCHIVED">Archived</SelectItem></SelectContent></Select>
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}><SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
          <Button onClick={handleCreate}><Plus className="h-4 w-4" /> Add Product</Button>
        </div>
      </div>

      <div className="rounded-lg border border-navy-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-navy-50"><tr className="text-left text-sm font-semibold text-navy-500 border-b border-navy-200">
            <th className="p-3 w-16">Image</th><th className="p-3">Product</th><th className="p-3 hidden md:table-cell">Category</th><th className="p-3 hidden md:table-cell">Brand</th><th className="p-3 text-right">Price</th><th className="p-3 text-center">Stock</th><th className="p-3 text-center">Status</th><th className="p-3 w-32">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-navy-100">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-navy-50">
                <td className="p-3"><div className="h-10 w-10 rounded bg-navy-50 flex items-center justify-center text-lg">🛒</div></td>
                <td className="p-3"><p className="font-medium text-navy-900">{p.name}</p><p className="text-xs text-navy-400 font-mono">{p.sku}</p></td>
                <td className="p-3 hidden md:table-cell text-sm text-navy-500">{p.categoryName}</td>
                <td className="p-3 hidden md:table-cell text-sm text-navy-500">{p.brand}</td>
                <td className="p-3 text-right font-semibold text-navy-900">{formatNaira(p.price)}</td>
                <td className="p-3 text-center font-mono text-sm text-navy-700">{p.stock}</td>
                <td className="p-3 text-center"><StockStatusBadge status={p.stockStatus} /></td>
                <td className="p-3 flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-danger-600 hover:text-danger-700"><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <tbody><tr><td colSpan={8} className="p-8 text-center text-navy-500">No products found</td></tr></tbody>}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Product" : "Create Product"}</DialogTitle><DialogDescription>Fill in the product details below.</DialogDescription></DialogHeader>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); setCreateOpen(false); setEditing(null); success("Product saved", `"${form.name}" has been saved.`); }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label htmlFor="name">Product Name</Label><Input id="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div><Label htmlFor="sku">SKU</Label><Input id="sku" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><Label htmlFor="category">Category</Label><Select value={form.categoryId} onValueChange={v => setForm({...form, categoryId: v})}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label htmlFor="brand">Brand</Label><Select value={form.brand} onValueChange={v => setForm({...form, brand: v})}><SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger><SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label htmlFor="unit">Unit</Label><Input id="unit" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} placeholder="e.g. 500g, 1kg, each" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><Label htmlFor="price">Price (₦)</Label><Input id="price" type="number" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} required /></div>
              <div><Label htmlFor="compareAt">Compare At Price (₦)</Label><Input id="compareAt" type="number" value={form.compareAtPrice} onChange={e => setForm({...form, compareAtPrice: Number(e.target.value)})} /></div>
              <div><Label htmlFor="stock">Stock Qty</Label><Input id="stock" type="number" value={form.stock} onChange={e => setForm({...form, stock: Number(e.target.value)})} /></div>
            </div>
            <div><Label htmlFor="description">Description</Label><textarea id="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full rounded-md border border-navy-200 p-2 text-sm focus:border-fresh-500 focus:outline-none focus:ring-1 focus:ring-fresh-500" rows={3} /></div>
            <div><Label htmlFor="status">Status</Label><Select value={form.status} onValueChange={v => setForm({...form, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="ARCHIVED">Archived</SelectItem></SelectContent></Select></div>
            <DialogFooter><Button type="submit">Save</Button><Button type="button" variant="outline" onClick={() => { setCreateOpen(false); setEditing(null) }}>Cancel</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
