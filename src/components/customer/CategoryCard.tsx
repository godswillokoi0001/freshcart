import * as React from "react"
import { Link } from "react-router-dom"
import { ChevronRight, Package } from "lucide-react"
import type { Category } from "@app-types/index"
import { categoryVisual } from "@lib/catalog"
import { cn } from "@lib/utils"

/**
 * CategoryCard — rectangular tile (not circular), market-aisle style.
 *
 * Design decisions vs. previous version:
 * - 3:2 rectangular image (not circular) — reads like a product shelf label
 * - No hover:-translate-y-1 or hover:shadow-md
 * - On hover: only the category name gets an fc-market underline
 * - No uppercase tracking-wider eyebrow label
 * - Sharp corners throughout
 */
export function CategoryCard({ category, className }: { category: Category; className?: string }) {
  const visual = categoryVisual(category.name)
  const [imgError, setImgError] = React.useState(false)

  return (
    <Link
      to={`/categories/${category.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden bg-white border border-fc-cream-200 hover:border-fc-leaf transition-colors duration-150",
        className
      )}
      style={{ borderRadius: 0 }}
    >
      {/* Rectangular 3:2 image — not a circle */}
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-fc-cream">
        {category.imageUrl && !imgError ? (
          <img
            src={category.imageUrl}
            alt={category.name}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: visual.tint, color: visual.accent }}
          >
            <Package className="h-8 w-8 opacity-60" />
          </div>
        )}
      </div>

      {/* Name and count — below the image, left-aligned */}
      <div className="px-3 py-2.5">
        <span
          className={cn(
            "block text-sm font-semibold text-fc-earth transition-colors line-clamp-1",
            "group-hover:text-fc-market group-hover:underline underline-offset-2"
          )}
        >
          {category.name}
        </span>
        <span className="mt-0.5 block text-xs text-fc-smoke">
          {category.productCount} items
        </span>
      </div>
    </Link>
  )
}

export function CategoryBanner({ category }: { category: Category }) {
  const visual = categoryVisual(category.name)
  const [imgError, setImgError] = React.useState(false)

  return (
    <div
      className="relative flex flex-col sm:flex-row items-center justify-between overflow-hidden border border-fc-cream-200 p-6 sm:p-8"
      style={{ backgroundColor: visual.tint, borderRadius: 0 }}
    >
      <div className="z-10 max-w-lg">
        <p className="text-xs font-semibold text-fc-smoke uppercase tracking-wide">
          Department
        </p>
        <h1 className="mt-1 font-display italic text-3xl font-bold text-fc-earth sm:text-4xl">
          {category.name}
        </h1>
        <p className="mt-2 text-sm text-fc-earth/70 sm:text-base leading-relaxed">
          {category.description}
        </p>
        <Link
          to="/categories"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-fc-leaf hover:text-fc-leaf-700 transition-colors"
        >
          All departments <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {category.imageUrl && !imgError ? (
        <div className="mt-6 sm:mt-0 sm:ml-6 shrink-0">
          <img
            src={category.imageUrl}
            alt={category.name}
            className="h-32 w-32 sm:h-40 sm:w-40 object-cover shadow-md ring-4 ring-white/60"
            style={{ borderRadius: 0 }}
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div
          className="mt-6 sm:mt-0 sm:ml-6 flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center shadow-md"
          style={{ backgroundColor: `${visual.accent}20`, color: visual.accent, borderRadius: 0 }}
        >
          <Package className="h-16 w-16" />
        </div>
      )}
    </div>
  )
}
