import React from "react"
import { useToast } from "@context/ToastContext"
import { Link } from "react-router-dom"
import { Search, Plus, Filter, Edit, Trash2, ChevronRight, TicketPercent, Calendar, ChevronLeft } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Badge } from "@components/ui/Badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@components/ui/Dialog"
import { coupons } from "@data/admin"
import { formatNaira, formatDate } from "@lib/format"
import { cn } from "@lib/utils"

const types = ["all", "PERCENTAGE", "FIXED"] as const
const statuses = ["all", "ACTIVE", "EXPIRED", "DISABLED"] as const

export function AdminCouponsPage() {
  const { success } = useToast()
  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<typeof types[number]>("all")
  const [statusFilter, setStatusFilter] = React.useState<typeof statuses[number]>("all")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<typeof coupons[0] | null>(null)
  const [form, setForm] = React.useState({ code: "", discountType: "PERCENTAGE", discountValue: 10, minOrder: 0, expiresAt: new Date(Date.now() + 30*86400000).toISOString().slice(0,16), usageLimit: 0, status: "ACTIVE" })

  const filtered = React.useMemo(() => {
    let list = [...coupons]
    if (search) { const q = search.toLowerCase(); list = list.filter(c => c.code.toLowerCase().includes(q)) }
    if (typeFilter !== "all") list = list.filter(c => c.discountType === typeFilter)
    if (statusFilter !== "all") list = list.filter(c => c.status === statusFilter)
    return list.sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime())
  }, [search, typeFilter, statusFilter])

  const handleCreate = () => { setEditing(null); setForm({ code: "", discountType: "PERCENTAGE", discountValue: 10, minOrder: 0, expiresAt: new Date(Date.now() + 30*86400000).toISOString().slice(0,16), usageLimit: 0, status: "ACTIVE" }); setCreateOpen(true) }
  const handleEdit = (c: typeof coupons[0]) => { setEditing(c); setForm({ ...c, expiresAt: c.expiresAt.slice(0,16) }); setCreateOpen(true) }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-navy-900">Coupon Management</h1><p className="mt-1 text-sm text-navy-500">{filtered.length} coupon{filtered.length !== 1 ? "s" : ""}</p></div>
        <div className="flex flex-wrap gap-3"><div className="relative min-w-0 flex-1 sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search coupon codes…" className="h-10 pl-9" /></div><Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger><SelectContent>{types.map(t => <SelectItem key={t} value={t}>{t === "all" ? "All Types" : t}</SelectItem>)}</SelectContent></Select><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All" : s}</SelectItem>)}</SelectContent></Select><Button onClick={handleCreate}><Plus className="h-4 w-4" /> Create Coupon</Button></div>
      </div>

      <div className="rounded-lg border border-navy-200 bg-white overflow-hidden">
        <table className="w-full"><thead className="bg-navy-50"><tr className="text-left text-sm font-semibold text-navy-500 border-b border-navy-200"><th className="p-3">Code</th><th className="p-3">Type</th><th className="p-3">Value</th><th className="p-3">Min Order</th><th className="p-3">Expires</th><th className="p-3">Usage</th><th className="p-3">Status</th><th className="p-3 w-32">Actions</th></tr></thead><tbody className="divide-y divide-navy-100">
          {filtered.map(c => (
            <tr key={c.id} className="hover:bg-navy-50">
              <td className="p-3 font-mono font-medium text-navy-900">{c.code}</td>
              <td className="p-3"><Badge variant="default">{c.discountType}</Badge></td>
              <td className="p-3 font-medium text-navy-900">{c.discountType === "PERCENTAGE" ? c.discountValue + "%" : formatNaira(c.discountValue)}</td>
              <td className="p-3 text-sm text-navy-500">{c.minOrder > 0 ? formatNaira(c.minOrder) : "No minimum"}</td>
              <td className="p-3 text-sm text-navy-500">{formatDate(c.expiresAt)}</td>
              <td className="p-3 text-sm text-navy-500">{c.usageLimit > 0 ? `${c.usedCount} / ${c.usageLimit}` : `${c.usedCount} / ∞`}</td>
              <td className="p-3"><Badge variant={c.status === "ACTIVE" ? "success" : c.status === "EXPIRED" ? "default" : "destructive"}>{c.status}</Badge></td>
              <td className="p-3 flex items-center gap-2"><Button variant="ghost" size="icon" onClick={() => handleEdit(c)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-danger-600"><Trash2 className="h-4 w-4" /></Button></td>
            </tr>
          ))}
        </tbody></table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{editing ? "Edit Coupon" : "Create Coupon"}</DialogTitle></DialogHeader>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); setCreateOpen(false); setEditing(null); success("Coupon saved", `"${form.code}" has been saved.`); }}>
          <div><Label htmlFor="code">Coupon Code</Label><Input id="code" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} required placeholder="e.g. FRESH500" /></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="type">Discount Type</Label><Select value={form.discountType} onValueChange={v => setForm({...form, discountType: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PERCENTAGE">Percentage</SelectItem><SelectItem value="FIXED">Fixed Amount</SelectItem></SelectContent></Select></div><div><Label htmlFor="value">Value</Label><Input id="value" type="number" value={form.discountValue} onChange={e => setForm({...form, discountValue: Number(e.target.value)})} min="1" required /></div></div>
          <div><Label htmlFor="minOrder">Minimum Order (₦)</Label><Input id="minOrder" type="number" value={form.minOrder} onChange={e => setForm({...form, minOrder: Number(e.target.value)})} placeholder="0 for no minimum" /></div>
          <div><Label htmlFor="expiresAt">Expires At</Label><Input id="expiresAt" type="datetime-local" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} required /></div>
          <div><Label htmlFor="usageLimit">Usage Limit (0 = unlimited)</Label><Input id="usageLimit" type="number" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: Number(e.target.value)})} min="0" /></div>
          <div><Label htmlFor="status">Status</Label><Select value={form.status} onValueChange={v => setForm({...form, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="DISABLED">Disabled</SelectItem></SelectContent></Select></div>
          <DialogFooter><Button type="submit">Save</Button><Button type="button" variant="outline" onClick={() => { setCreateOpen(false); setEditing(null) }}>Cancel</Button></DialogFooter>
        </form></DialogContent>
      </Dialog>
    </div>
  )
}

import { Label } from "@components/ui/Label"
