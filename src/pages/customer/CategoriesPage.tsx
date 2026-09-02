import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { CategoryCard } from "@components/customer/CategoryCard"
import { categories } from "@data/categories"

export function CategoriesPage() {
  return (
    <div className="container py-8">
      <nav className="mb-6 flex items-center gap-1 text-sm text-navy-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-fresh-700">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-navy-900">Categories</span>
      </nav>
      <h1 className="text-3xl font-bold text-navy-900">All Categories</h1>
      <p className="mt-1 text-sm text-navy-500">Browse every aisle of the FreshCart supermarket.</p>
      <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {categories.map((c) => (
          <CategoryCard key={c.id} category={c} />
        ))}
      </div>
    </div>
  )
}
