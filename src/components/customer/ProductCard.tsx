import { Link } from "react-router-dom"
import { Heart, ShoppingBag, Plus, Minus } from "lucide-react"
import type { Product } from "@app-types/index"
import { formatNaira, discountPercent } from "@lib/format"
import { ProductImage } from "@components/shared/ProductImage"
import { RatingStars } from "@components/shared/RatingStars"
import { useCart } from "@context/CartContext"
import { useWishlist } from "@context/WishlistContext"
import { cn } from "@lib/utils"

/**
 * ProductCard — sharp-corner market-stall style.
 *
 * Design decisions vs. the previous version:
 * - border-radius: 0 (sharp corners — price-card directness)
 * - border: 1px solid fc-cream-200 at rest, 2px solid fc-leaf on hover (no lift, no shadow)
 * - Price in fc-earth font-bold (no slate-900 tinted-black)
 * - Add-to-cart: fc-market CTA (no emerald-700)
 * - Discount badge: sharp rectangle, fc-market (no pill, no rounded-md)
 * - Brand label: normal case, no uppercase tracking-wider
 * - No hover:-translate-y-* anywhere
 */
export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { addItem, setQuantity, getQuantity } = useCart()
  const { has, toggle } = useWishlist()
  const discount = discountPercent(product.price, product.compareAtPrice)
  const outOfStock = product.stockStatus === "OUT_OF_STOCK"
  const lowStock = product.stockStatus === "LOW_STOCK" || (product.stock > 0 && product.stock <= 5)
  const inCartQty = getQuantity(product.id)

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden bg-white transition-colors duration-150",
        "border border-fc-cream-200 hover:border-fc-leaf",
        className
      )}
      style={{ borderRadius: 0 }}
    >
      {/* Wishlist toggle */}
      <button
        type="button"
        aria-label={has(product.id) ? "Remove from wishlist" : "Save to wishlist"}
        onClick={(e) => {
          e.preventDefault()
          toggle(product)
        }}
        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center bg-white/90 shadow-sm ring-1 ring-fc-cream-200 transition-colors hover:bg-white active:scale-90"
        style={{ borderRadius: 0 }}
      >
        <Heart
          className={cn(
            "h-3.5 w-3.5 transition-colors",
            has(product.id) ? "fill-danger-500 text-danger-500" : "text-fc-smoke hover:text-fc-earth"
          )}
        />
      </button>

      {/* Product image */}
      <Link to={`/products/${product.slug}`} className="relative block overflow-hidden">
        <ProductImage
          productName={product.name}
          categoryName={product.categoryName}
          imageUrl={product.imageUrl}
          className="aspect-square w-full object-cover"
          size="md"
        />

        {/* Discount badge — sharp rectangle, fc-market */}
        {discount && discount > 0 && (
          <span
            className="absolute left-0 top-3 bg-fc-market px-2.5 py-0.5 text-[11px] font-bold text-white"
            style={{ borderRadius: 0 }}
          >
            {discount}% OFF
          </span>
        )}

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-fc-chalk/80">
            <span className="bg-fc-earth px-3 py-1 text-xs font-semibold text-fc-cream">
              Out of stock
            </span>
          </div>
        )}
      </Link>

      {/* Product info */}
      <div className="flex flex-1 flex-col p-3.5">
        {/* Brand — normal case, no uppercase tracking */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-fc-leaf line-clamp-1">
            {product.brand}
          </span>
          <span className="text-xs text-fc-smoke shrink-0">{product.unit}</span>
        </div>

        <Link
          to={`/products/${product.slug}`}
          className="mt-1 line-clamp-2 text-sm font-semibold text-fc-earth hover:text-fc-market transition-colors"
        >
          {product.name}
        </Link>

        <div className="mt-1 flex items-center gap-1.5">
          <RatingStars rating={product.rating} count={product.reviewCount} />
        </div>

        {lowStock && !outOfStock && (
          <p className="mt-1 text-[11px] font-medium text-warning-600">
            Only {product.stock} left
          </p>
        )}

        {/* Price and cart action */}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-fc-earth">
              {formatNaira(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-fc-smoke line-through">
                {formatNaira(product.compareAtPrice)}
              </span>
            )}
          </div>

          <div className="mt-2">
            {outOfStock ? (
              <button
                disabled
                className="w-full bg-fc-cream py-2 text-xs font-semibold text-fc-smoke cursor-not-allowed"
                style={{ borderRadius: 0 }}
              >
                Unavailable
              </button>
            ) : inCartQty > 0 ? (
              <div
                className="flex items-center justify-between border border-fc-leaf bg-fc-leaf-50 px-2 py-1.5 text-fc-earth"
                style={{ borderRadius: 0 }}
              >
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity(product.id, inCartQty - 1)}
                  className="flex h-6 w-6 items-center justify-center bg-white text-fc-leaf hover:bg-fc-leaf-50 transition-colors"
                  style={{ borderRadius: 0 }}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs font-bold text-fc-earth">{inCartQty} in cart</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={inCartQty >= product.stock}
                  onClick={() => addItem(product, 1)}
                  className="flex h-6 w-6 items-center justify-center bg-fc-leaf text-white hover:bg-fc-leaf-700 disabled:opacity-50 transition-colors"
                  style={{ borderRadius: 0 }}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => addItem(product)}
                className="flex w-full items-center justify-center gap-1.5 bg-fc-market px-3 py-2 text-xs font-bold text-white hover:bg-fc-market-600 active:scale-[0.98] transition-colors"
                style={{ borderRadius: 0 }}
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
    <div className={cn("grid grid-cols-2 gap-px bg-fc-cream-200 sm:grid-cols-3 sm:gap-px md:grid-cols-4 lg:grid-cols-5", className)}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} className="bg-white" />
      ))}
    </div>
  )
}
