import * as React from "react"
import { Search, Filter, AlertTriangle, CheckCircle2, MinusCircle, XCircle, Package } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@components/ui/Table"
import { StockStatusBadge } from "@components/shared/StatusBadges"
import { products } from "@data/products"
import { formatNaira } from "@lib/format"
import { cn } from "@lib/utils"

const statusOptions = ["all", "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "DISCONTINUED"] as const

function ProductDetailModal({ product, onClose }: { product: typeof products[0]; onClose: () => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded bg-navy-50 flex items-center justify-center text-3xl">🛒</div>
        <div>
          <p className="font-semibold text-navy-900">{product.name}</p>
          <p className="text-sm text-navy-500">{product.sku}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div><span className="text-navy-500">Category:</span> <span className="font-medium">{product.categoryName}</span></div>
        <div><span className="text-navy-500">Brand:</span> <span className="font-medium">{product.brand}</span></div>
        <div><span className="text-navy-500">Unit:</span> <span className="font-medium">{product.unit}</span></div>
        <div><span className="text-navy-500">Price:</span> <span className="font-medium">{formatNaira(product.price)}</span></div>
        <div className="col-span-2"><span className="text-navy-500">Stock:</span> <span className="font-medium">{product.stock} ({product.stockStatus})</span></div>
      </div>
      <Button className="w-full" onClick={() => { onClose(); alert("Adjust stock (demo)") }}>Adjust Stock</Button>
    </div>
  )
}

export function AdminInventoryPage() {
  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<typeof statusOptions[number]>("all")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [sort, setSort] = React.useState<"name" | "stock" | "price" | "status">("name")
  const [selectedRow, setSelectedRow] = React.useState<string | null>(null)

  const filtered = React.useMemo(() => {
    let list = [...products]
    if (query) { const q = query.toLowerCase(); list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) }
    if (statusFilter !== "all") list = list.filter(p => p.stockStatus === statusFilter)
    if (categoryFilter !== "all") list = list.filter(p => p.categoryId === categoryFilter)
    switch (sort) { case "stock": list.sort((a,b) => a.stock - b.stock); break; case "price": list.sort((a,b) => b.price - a.price); break; case "status": list.sort((a,b) => a.stockStatus.localeCompare(b.stockStatus)); break; default: list.sort((a,b) => a.name.localeCompare(b.name)); }
    return list
  }, [query, statusFilter, categoryFilter, sort])

  const categories = [...new Set(products.map(p => p.categoryId))].sort()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-navy-900">Inventory Overview</h1><p className="mt-1 text-sm text-navy-500">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p></div>
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-0 flex-1 sm:max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or SKU…" className="h-10 pl-9" /></div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}><SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent>{statusOptions.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All" : s.replace("_", " ")}</SelectItem>)}</SelectContent></Select>
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}><SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
          <Select value={sort} onValueChange={(value) => setSort(value as typeof sort)}><SelectTrigger className="w-36"><SelectValue placeholder="Sort" /></SelectTrigger><SelectContent><SelectItem value="name">Name A–Z</SelectItem><SelectItem value="stock">Stock: Low to High</SelectItem><SelectItem value="price">Price: High to Low</SelectItem><SelectItem value="status">Status</SelectItem></SelectContent></Select>
        </div>
      </div>

      <div className="rounded-lg border border-navy-200 bg-white overflow-hidden">
        <Table><TableHeader><TableRow>
          <TableHead className="w-12">Image</TableHead><TableHead>Product</TableHead><TableHead className="hidden md:table-cell">Category</TableHead><TableHead className="hidden md:table-cell">Brand</TableHead><TableHead className="text-right">Price</TableHead><TableHead className="text-center">Stock</TableHead><TableHead className="text-center">Status</TableHead><TableHead className="w-24">Actions</TableHead>
        </TableRow></TableHeader><TableBody>
          {filtered.map(p => (
            <TableRow key={p.id} className={cn("hover:bg-navy-50 cursor-pointer", selectedRow === p.id && "bg-fresh-50")} onClick={() => setSelectedRow(prev => prev === p.id ? null : p.id)}>
              <TableCell className="w-12"><div className="h-10 w-10 rounded bg-navy-50 flex items-center justify-center text-lg">🛒</div></TableCell>
              <TableCell><p className="font-medium text-navy-900">{p.name}</p><p className="text-xs text-navy-400 font-mono">{p.sku}</p></TableCell>
              <TableCell className="hidden md:table-cell text-sm text-navy-500">{p.categoryName}</TableCell>
              <TableCell className="hidden md:table-cell text-sm text-navy-500">{p.brand}</TableCell>
              <TableCell className="text-right font-semibold text-navy-900">{formatNaira(p.price)}</TableCell>
              <TableCell className="text-center font-mono text-sm text-navy-700">{p.stock}</TableCell>
              <TableCell className="text-center"><StockStatusBadge status={p.stockStatus} /></TableCell>
              <TableCell className="text-center"><Button variant="ghost" size="icon" className="text-navy-400 hover:text-navy-700" onClick={e => { e.stopPropagation(); alert("Adjust stock (demo)") }}><Package className="h-4 w-4" /></Button></TableCell>
            </TableRow>
          ))}
        </TableBody></Table>
      </div>

      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-navy-900">Product Details</h2><Button variant="ghost" size="icon" onClick={() => setSelectedRow(null)}><XCircle className="h-5 w-5" /></Button></div>
            <ProductDetailModal product={products.find(p => p.id === selectedRow)!} onClose={() => setSelectedRow(null)} />
          </div>
        </div>
      )}
    </div>
  )
}
