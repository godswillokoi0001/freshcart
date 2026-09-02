import { Link, useNavigate } from "react-router-dom"
import { ShoppingCart, ArrowRight, Trash2 } from "lucide-react"
import { Button } from "@components/ui/Button"
import { EmptyState } from "@components/ui/EmptyState"
import { CartItemRow } from "@components/customer/CartItemRow"
import { CheckoutSummary } from "@components/customer/CheckoutSummary"
import { ProductCard } from "@components/customer/ProductCard"
import { useCart, FREE_DELIVERY_THRESHOLD } from "@context/CartContext"
import { products } from "@data/products"
import { Input } from "@components/ui/Input"

export function CartPage() {
  const { lines, subtotal, deliveryFee, discount, total, couponCode, applyCoupon, removeCoupon, clearCart } = useCart()
  const navigate = useNavigate()

  if (lines.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="mb-2 text-2xl font-bold text-navy-900">Your Cart</h1>
        <EmptyState
          icon={ShoppingCart}
          title="No items in your cart yet."
          description="Browse our aisles and add your household essentials — they'll show up here."
          action={{ label: "Start shopping", href: "/shop" }}
          secondaryAction={{ label: "See today's deals", href: "/deals" }}
        />
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-navy-900">Popular this week</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {products.filter((p) => p.isFeatured).slice(0, 5).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">
          Your Cart <span className="text-base font-normal text-navy-500">({lines.length} item{lines.length !== 1 ? "s" : ""})</span>
        </h1>
        <Button variant="ghost" size="sm" className="text-danger-600 hover:bg-danger-50" onClick={clearCart}>
          <Trash2 className="h-4 w-4" /> Clear cart
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {lines.map((l) => (
            <CartItemRow key={l.productId} productId={l.productId} />
          ))}
          <Link to="/shop" className="inline-flex items-center text-sm font-medium text-fresh-700 hover:underline">
            ← Continue shopping
          </Link>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <CheckoutSummary
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            discount={discount}
            total={total}
            freeDeliveryThreshold={FREE_DELIVERY_THRESHOLD}
            itemCount={lines.reduce((s, l) => s + l.quantity, 0)}
          >
            {couponCode ? (
              <div className="flex items-center justify-between rounded-md bg-fresh-50 px-3 py-2 text-sm">
                <span className="font-medium text-fresh-800">Coupon: {couponCode}</span>
                <button type="button" onClick={removeCoupon} className="text-danger-600 hover:underline">
                  Remove
                </button>
              </div>
            ) : (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  const input = e.currentTarget.elements.namedItem("coupon") as HTMLInputElement
                  if (input.value) applyCoupon(input.value)
                }}
              >
                <Input name="coupon" placeholder="Coupon code" aria-label="Coupon code" />
                <Button type="submit" variant="secondary">Apply</Button>
              </form>
            )}
            <Button size="lg" className="mt-4 w-full" onClick={() => navigate("/checkout")}>
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="mt-3 text-center text-xs text-navy-400">
              Free delivery on orders above ₦50,000
            </p>
          </CheckoutSummary>
        </div>
      </div>
    </div>
  )
}
