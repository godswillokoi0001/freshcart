import { Link } from "react-router-dom"
import { ChevronRight, BadgePercent } from "lucide-react"
import { ProductGrid } from "@components/customer/ProductCard"
import { dealProducts } from "@data/products"

export function DealsPage() {
  return (
    <div className="pb-4">
      <section className="border-b border-navy-200 bg-fresh-600">
        <div className="container py-10">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/20 text-white">
              <BadgePercent className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-3xl font-bold text-white">Today's Deals</h1>
              <p className="mt-1 text-sm text-fresh-100">
                Real discounts on real staples — updated every morning.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8">
        <nav className="mb-6 flex items-center gap-1 text-sm text-navy-500" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-fresh-700">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-navy-900">Deals</span>
        </nav>
        <ProductGrid products={dealProducts} />
      </div>
    </div>
  )
}
