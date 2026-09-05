import * as React from "react"
import { Link } from "react-router-dom"
import { ChevronRight, ArrowRight, Package } from "lucide-react"
import type { Category } from "@app-types/index"
import { categoryVisual } from "@lib/catalog"
import { cn } from "@lib/utils"

export function CategoryCard({ category, className }: { category: Category; className?: string }) {
  const visual = categoryVisual(category.name)
  const [imgError, setImgError] = React.useState(false)

  return (
    <Link
      to={`/categories/${category.slug}`}
      className={cn(
        "group relative flex flex-col items-center overflow-hidden rounded-xl border border-slate-200 bg-white p-3 text-center shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500 hover:shadow-md",
        className
      )}
    >
      <div className="relative mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full ring-2 ring-slate-100 group-hover:ring-emerald-200 transition-all">
        {category.imageUrl && !imgError ? (
          <img
            src={category.imageUrl}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-115"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: visual.tint, color: visual.accent }}
          >
            <Package className="h-8 w-8" />
          </div>
        )}
      </div>
      <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
        {category.name}
      </span>
      <span className="mt-0.5 text-xs font-medium text-slate-500">
        {category.productCount} items
      </span>
    </Link>
  )
}

export function CategoryBanner({ category }: { category: Category }) {
  const visual = categoryVisual(category.name)
  const [imgError, setImgError] = React.useState(false)

  return (
    <div
      className="relative flex flex-col sm:flex-row items-center justify-between overflow-hidden rounded-2xl border border-slate-200 p-6 sm:p-8"
      style={{ backgroundColor: visual.tint }}
    >
      <div className="z-10 max-w-lg">
        <span
          className="inline-block rounded-full bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-xs"
          style={{ color: visual.accent }}
        >
          Supermarket Category
        </span>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">{category.name}</h1>
        <p className="mt-2 text-sm text-slate-700 sm:text-base leading-relaxed">{category.description}</p>
        <Link
          to="/categories"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors"
        >
          Browse all categories <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      {category.imageUrl && !imgError ? (
        <div className="mt-6 sm:mt-0 sm:ml-6 shrink-0">
          <img
            src={category.imageUrl}
            alt={category.name}
            className="h-32 w-32 sm:h-40 sm:w-40 rounded-2xl object-cover shadow-md ring-4 ring-white/60"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div
          className="mt-6 sm:mt-0 sm:ml-6 flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center rounded-2xl shadow-md ring-4 ring-white/60"
          style={{ backgroundColor: `${visual.accent}20`, color: visual.accent }}
        >
          <Package className="h-16 w-16" />
        </div>
      )}
    </div>
  )
}

