import React from "react"
import { Link } from "react-router-dom"
import { Search, Filter, Star, ChevronRight, User, MessageSquare, ChevronLeft, AlertCircle } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Badge } from "@components/ui/Badge"
import { reviews } from "@data/reviews"
import { products } from "@data/products"
import { formatDate } from "@lib/format"
import { cn } from "@lib/utils"

const ratingFilters = ["all", "5", "4", "3", "2", "1"] as const

export function AdminReviewsPage() {
  const [search, setSearch] = React.useState("")
  const [ratingFilter, setRatingFilter] = React.useState<typeof ratingFilters[number]>("all")

  const filtered = React.useMemo(() => {
    let list = [...reviews]
    if (search) { const q = search.toLowerCase(); list = list.filter(r => r.title.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q)) }
    if (ratingFilter !== "all") list = list.filter(r => r.rating === Number(ratingFilter))
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [search, ratingFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-navy-900">Reviews</h1><p className="mt-1 text-sm text-navy-500">{filtered.length} review{filtered.length !== 1 ? "s" : ""}</p></div>
        <div className="flex flex-wrap gap-3"><div className="relative min-w-0 flex-1 sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reviews…" className="h-10 pl-9" /></div><Select value={ratingFilter} onValueChange={setRatingFilter}><SelectTrigger className="w-36"><SelectValue placeholder="Rating" /></SelectTrigger><SelectContent>{ratingFilters.map(r => <SelectItem key={r} value={r}>{r === "all" ? "All Ratings" : r + " ★"}</SelectItem>)}</SelectContent></Select></div>
      </div>

      <div className="space-y-3">
        {filtered.map(r => {
          const product = products.find(p => p.id === r.productId)
          return (
            <Link key={r.id} to="#" className="block rounded-lg border border-navy-200 bg-white p-4 hover:border-navy-300">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-50"><Star className="h-5 w-5 text-amber-400" /></div>
                  <div className="min-w-0"><p className="font-medium text-navy-900 truncate">{product?.name || "Unknown Product"}</p><p className="text-sm text-navy-500">by {r.customerName} · {formatDate(r.date)}</p></div>
                </div>
                <div className="flex items-center gap-3"><div className="text-right"><p className="font-semibold text-navy-900">{r.rating} <Star className="inline h-4 w-4 fill-amber-400 text-amber-400" /></p><p className="text-xs text-navy-500">Verified: {r.verifiedPurchase ? "Yes" : "No"}</p></div><ChevronRight className="h-5 w-5 text-navy-300" /></div>
              </div>
              <p className="mt-3 text-sm text-navy-600">{r.title}</p>
              <p className="mt-1 text-sm text-navy-500 line-clamp-2">{r.comment}</p>
            </Link>
          )}
        )}
      </div>
    </div>
  )
}
