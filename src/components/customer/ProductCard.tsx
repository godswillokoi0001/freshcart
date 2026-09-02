import { Link } from "react-router-dom"
import { Heart, ShoppingCart } from "lucide-react"
import type { Product } from "@app-types/index"
import { formatNaira, discountPercent } from "@lib/format"
import { ProductImage } from "@components/shared/ProductImage"
import { RatingStars } from "@components/shared/RatingStars"
import { Button } from "@components/ui/Button"
import { Badge } from "@components/ui/Badge"
import { useCart } from "@context/CartContext"
import { useWishlist } from "@context/WishlistContext"
import { cn } from "@lib/utils"

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { addItem } = useCart()
  const { has, toggle } = useWishlist()
  const discount = discountPercent(product.price, product.compareAtPrice)
  const outOfStock = product.stockStatus === "OUT_OF_STOCK"

  return (
    <div className={cn("group relative flex flex-col rounded-lg border border-navy-200 bg-white shadow-sm transition-shadow hover:shadow-md", className)}>
      <button
        type="button"
        aria-label={has(product.id) ? "Remove from wishlist" : "Save to wishlist"}
        onClick={() => toggle(product)}
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-navy-200 transition-colors hover:bg-navy-50"
      >
        <Heart className={cn("h-4 w-4", has(product.id) ? "fill-danger-500 text-danger-500" : "text-navy-400")} />
      </button>

      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative">
          <ProductImage
            productName={product.name}
            categoryName={product.categoryName}
            imageUrl={product.imageUrl}
            className="aspect-square w-full rounded-b-none"
            size="md"
          />
          {discount && (
            <span className="absolute left-2 top-2 rounded-full bg-danger-500 px-2 py-0.5 text-xs font-semibold text-white">
              {discount}% OFF
            </span>
          )}
          {outOfStock && (
            <span className="absolute inset-0 flex items-center justify-center bg-white/70">
              <span className="rounded-full bg-navy-900 px-3 py-1 text-xs font-semibold text-white">Out of stock</span>
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-navy-400">{product.brand}</p>
        <Link to={`/products/${product.slug}`} className="mt-0.5 line-clamp-2 text-sm font-medium text-navy-900 hover:text-fresh-700">
          {product.name}
        </Link>
        <p className="mt-0.5 text-xs text-navy-500">{product.unit}</p>
        <RatingStars rating={product.rating} count={product.reviewCount} className="mt-1" />

        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-navy-900">{formatNaira(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-navy-400 line-through">{formatNaira(product.compareAtPrice)}</span>
            )}
          </div>
          <Button
            className="mt-2 w-full"
            size="sm"
            disabled={outOfStock}
            onClick={() => addItem(product)}
          >
            <ShoppingCart className="h-4 w-4" />
            {outOfStock ? "Out of stock" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ProductGrid({ products, className }: { products: Product[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5", className)}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
