import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import type { Category } from "@app-types/index"
import { categoryVisual } from "@lib/catalog"
import { cn } from "@lib/utils"

export function CategoryCard({ category, className }: { category: Category; className?: string }) {
  const visual = categoryVisual(category.name)
  return (
    <Link
      to={`/categories/${category.slug}`}
      className={cn(
        "group flex flex-col items-center rounded-lg border border-navy-200 bg-white p-4 text-center shadow-sm transition-all hover:border-fresh-300 hover:shadow-md",
        className
      )}
    >
      <span
        className="flex h-14 w-14 items-center justify-center rounded-full text-2xl transition-transform group-hover:scale-110"
        style={{ backgroundColor: visual.tint }}
      >
        {visual.emoji}
      </span>
      <span className="mt-2 text-sm font-medium text-navy-900 group-hover:text-fresh-700">{category.name}</span>
      <span className="text-xs text-navy-400">{category.productCount} items</span>
    </Link>
  )
}

export function CategoryBanner({ category }: { category: Category }) {
  const visual = categoryVisual(category.name)
  return (
    <div className="flex items-center justify-between rounded-lg border border-navy-200 p-6" style={{ backgroundColor: visual.tint }}>
      <div>
        <p className="text-sm font-medium uppercase tracking-wide" style={{ color: visual.accent }}>
          Category
        </p>
        <h1 className="mt-1 text-2xl font-bold text-navy-900">{category.name}</h1>
        <p className="mt-1 max-w-md text-sm text-navy-600">{category.description}</p>
        <Link
          to="/categories"
          className="mt-3 inline-flex items-center text-sm font-medium text-navy-700 hover:text-fresh-700"
        >
          All categories <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <span className="hidden text-6xl sm:block" aria-hidden>
        {visual.emoji}
      </span>
    </div>
  )
}
