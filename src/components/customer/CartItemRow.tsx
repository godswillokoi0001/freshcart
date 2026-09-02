import { Minus, Plus, Trash2, Heart } from "lucide-react"
import type { Product } from "@app-types/index"
import { formatNaira } from "@lib/format"
import { ProductImage } from "@components/shared/ProductImage"
import { Button } from "@components/ui/Button"
import { useCart } from "@context/CartContext"
import { useWishlist } from "@context/WishlistContext"
import { cn } from "@lib/utils"

export function QuantityStepper({
  value,
  onChange,
  max = 99,
  size = "md",
  className,
}: {
  value: number
  onChange: (v: number) => void
  max?: number
  size?: "sm" | "md"
  className?: string
}) {
  const btn = size === "sm" ? "h-8 w-8" : "h-9 w-9"
  return (
    <div className={cn("inline-flex items-center rounded-md border border-navy-200", className)}>
      <button
        type="button"
        aria-label="Decrease quantity"
        className={cn("flex items-center justify-center rounded-l-md text-navy-600 hover:bg-navy-50", btn)}
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className={cn("min-w-[2.5rem] text-center text-sm font-semibold text-navy-900", size === "sm" && "text-xs")}>
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        className={cn("flex items-center justify-center rounded-r-md text-navy-600 hover:bg-navy-50 disabled:opacity-40", btn)}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

export function CartItemRow({ productId, onNavigate }: { productId: string; onNavigate?: () => void }) {
  const { lines, setQuantity, removeItem } = useCart()
  const { has, toggle, products } = useWishlist()
  const line = lines.find((l) => l.productId === productId)
  const product: Product | undefined = products.find((p) => p.id === productId)
  const fallback = lines.find((l) => l.productId === productId)!

  const name = product?.name ?? fallback.name
  const categoryName = product?.categoryName ?? "Household"
  const imageUrl = product?.imageUrl ?? fallback.imageUrl
  const stock = product?.stock ?? fallback.stock
  const outOfStock = product ? product.stockStatus === "OUT_OF_STOCK" : false

  if (!line) return null

  return (
    <div className={cn("flex gap-4 rounded-lg border border-navy-200 bg-white p-4", outOfStock && "opacity-70")}>
      <ProductImage
        productName={name}
        categoryName={categoryName}
        imageUrl={imageUrl}
        className="h-20 w-20 shrink-0 sm:h-24 sm:w-24"
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-navy-400">{line.brand}</p>
            <p className="truncate text-sm font-medium text-navy-900">{name}</p>
            <p className="mt-0.5 text-xs text-navy-500">{line.unit}</p>
            {outOfStock && (
              <p className="mt-1 text-xs font-medium text-danger-600">
                Out of stock — remove to continue checkout
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-navy-900">{formatNaira(line.price * line.quantity)}</p>
            {line.quantity > 1 && (
              <p className="text-xs text-navy-400">{formatNaira(line.price)} each</p>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <QuantityStepper
            value={line.quantity}
            onChange={(v) => setQuantity(line.productId, v)}
            max={stock}
            size="sm"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!has(line.productId) && product) toggle(product)
              removeItem(line.productId)
            }}
          >
            <Heart className="h-4 w-4" />
            Save for later
          </Button>
          <Button variant="ghost" size="sm" className="text-danger-600 hover:bg-danger-50" onClick={() => removeItem(line.productId)}>
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}
