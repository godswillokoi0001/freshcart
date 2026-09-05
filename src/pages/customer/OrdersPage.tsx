import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { ChevronRight, Package, Truck, RotateCcw, Clock, AlertCircle, CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@components/ui/Button"
import { EmptyState } from "@components/ui/EmptyState"
import { OrderStatusBadge } from "@components/shared/StatusBadges"
import { useAuth } from "@context/AuthContext"
import { useOrders } from "@context/OrdersContext"
import { useCart } from "@context/CartContext"
import { useToast } from "@context/ToastContext"
import { formatNaira, formatDate } from "@lib/format"
import { ProductImage } from "@components/shared/ProductImage"
import { products } from "@data/products"
import { cn } from "@lib/utils"

export function OrdersPage() {
  const { user } = useAuth()
  const { orders } = useOrders()
  const { addItem } = useCart()
  const { success } = useToast()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="container py-12">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Your Grocery Orders</h1>
        <EmptyState
          icon={Package}
          title="Please sign in to view your orders"
          description="Sign in to your FreshCart account to view past receipts, live delivery status, and re-order groceries."
          action={{ label: "Sign In", href: "/sign-in" }}
          secondaryAction={{ label: "Create Account", href: "/sign-up" }}
        />
      </div>
    )
  }

  // Display orders belonging to this user or all current orders in demo mode
  const myOrders = orders.filter(
    (o) => o.customerId === user.id || user.role === "customer" || user.id === "cust-1"
  )

  const handleReorder = (e: React.MouseEvent, orderItems: typeof orders[0]["items"]) => {
    e.preventDefault()
    e.stopPropagation()
    let count = 0
    orderItems.forEach((it) => {
      const prod = products.find((p) => p.id === it.productId)
      if (prod) {
        addItem(prod, it.quantity)
        count++
      }
    })
    success("Items Added to Cart", `Added ${count} items to your shopping cart.`)
    navigate("/cart")
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Your Grocery Orders</h1>
          <p className="mt-1 text-sm text-slate-500">Track current dispatches and review previous market receipts.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/shop">
            <ShoppingBag className="h-4 w-4 mr-1.5" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      {myOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="You haven't placed any orders yet"
          description="When you order pantry essentials and fresh produce, your delivery progress will appear here in real-time."
          action={{ label: "Start shopping", href: "/shop" }}
        />
      ) : (
        <div className="space-y-4">
          {myOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-900">{order.orderNumber}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="text-xs font-medium text-slate-500">
                  Placed on {formatDate(order.createdAt)}
                </div>
              </div>

              <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Items preview */}
                <div className="flex flex-wrap items-center gap-2">
                  {order.items.slice(0, 4).map((it, idx) => (
                    <div
                      key={idx}
                      className="h-12 w-12 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden"
                      title={`${it.name} (${it.quantity}x)`}
                    >
                      <ProductImage
                        productName={it.name}
                        imageUrl={it.imageUrl}
                        className="h-full w-full object-cover"
                        size="sm"
                      />
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                      +{order.items.length - 4}
                    </div>
                  )}
                  <div className="ml-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {order.items.length} product{order.items.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-slate-500">{order.deliverySlot}</p>
                  </div>
                </div>

                {/* Total and Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-500">Total Paid</p>
                    <p className="text-lg font-black text-slate-900">{formatNaira(order.total)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleReorder(e, order.items)}
                    >
                      Re-order
                    </Button>
                    <Button size="sm" asChild>
                      <Link to={`/orders/${order.orderNumber}`}>
                        Track Order <ChevronRight className="h-4 w-4 ml-0.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
