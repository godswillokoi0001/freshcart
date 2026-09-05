import { Link } from "react-router-dom"
import { Heart, ShoppingBag, Plus, Minus, Check } from "lucide-react"
import type { Product } from "@app-types/index"
import { formatNaira, discountPercent } from "@lib/format"
import { ProductImage } from "@components/shared/ProductImage"
import { RatingStars } from "@components/shared/RatingStars"
import { useCart } from "@context/CartContext"
import { useWishlist } from "@context/WishlistContext"
import { cn } from "@lib/utils"

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { addItem, setQuantity, getQuantity, isInCart } = useCart()
  const { has, toggle } = useWishlist()
  const discount = discountPercent(product.price, product.compareAtPrice)
  const outOfStock = product.stockStatus === "OUT_OF_STOCK"
  const lowStock = product.stockStatus === "LOW_STOCK" || (product.stock > 0 && product.stock <= 5)
  const inCartQty = getQuantity(product.id)

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md",
        className
      )}
    >
      {/* Wishlist toggle */}
      <button
        type="button"
        aria-label={has(product.id) ? "Remove from wishlist" : "Save to wishlist"}
        onClick={(e) => {
          e.preventDefault()
          toggle(product)
        }}
        className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-xs ring-1 ring-slate-200/80 transition-transform active:scale-90 hover:bg-white"
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-colors",
            has(product.id) ? "fill-rose-500 text-rose-500" : "text-slate-400 hover:text-slate-600"
          )}
        />
      </button>

      {/* Product Image & badges */}
      <Link to={`/products/${product.slug}`} className="block relative overflow-hidden">
        <ProductImage
          productName={product.name}
          categoryName={product.categoryName}
          imageUrl={product.imageUrl}
          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
          size="md"
        />

        {/* Discount badge */}
        {discount && discount > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-rose-600 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-xs">
            {discount}% OFF
          </span>
        )}

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-xs">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white shadow-sm">
              Out of stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-wider text-emerald-800 line-clamp-1">
            {product.brand}
          </span>
          <span className="font-medium text-slate-500 shrink-0">{product.unit}</span>
        </div>

        <Link
          to={`/products/${product.slug}`}
          className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900 hover:text-emerald-700 transition-colors"
        >
          {product.name}
        </Link>

        <div className="mt-1 flex items-center gap-1.5">
          <RatingStars rating={product.rating} count={product.reviewCount} />
        </div>

        {/* Low stock badge */}
        {lowStock && !outOfStock && (
          <p className="mt-1 text-[11px] font-medium text-amber-700">
            Only {product.stock} left in stock
          </p>
        )}

        {/* Price and Cart Action */}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-extrabold text-slate-900">
              {formatNaira(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {formatNaira(product.compareAtPrice)}
              </span>
            )}
          </div>

          <div className="mt-2.5">
            {outOfStock ? (
              <button
                disabled
                className="w-full rounded-lg bg-slate-100 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed"
              >
                Unavailable
              </button>
            ) : inCartQty > 0 ? (
              <div className="flex items-center justify-between rounded-lg border border-emerald-600 bg-emerald-50 px-2 py-1.5 text-emerald-900 shadow-xs">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity(product.id, inCartQty - 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-emerald-700 shadow-xs hover:bg-emerald-100 transition-colors"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs font-bold text-emerald-950">
                  {inCartQty} in cart
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={inCartQty >= product.stock}
                  onClick={() => addItem(product, 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-700 text-white shadow-xs hover:bg-emerald-800 disabled:opacity-50 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => addItem(product)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 active:scale-[0.98] transition-all"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductGrid({ products, className }: { products: Product[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5", className)}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}

