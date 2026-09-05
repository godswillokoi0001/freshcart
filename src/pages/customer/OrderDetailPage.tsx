import * as React from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import {
  ChevronRight,
  MapPin,
  Phone,
  CreditCard,
  Clock,
  Truck,
  Package,
  User,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  XCircle,
  HelpCircle,
  FileText,
} from "lucide-react"
import { Button } from "@components/ui/Button"
import { EmptyState } from "@components/ui/EmptyState"
import { OrderTimeline } from "@components/customer/OrderTimeline"
import { CheckoutSummary } from "@components/customer/CheckoutSummary"
import { OrderStatusBadge, PaymentStatusBadge } from "@components/shared/StatusBadges"
import { ProductImage } from "@components/shared/ProductImage"
import { useCart } from "@context/CartContext"
import { useOrders } from "@context/OrdersContext"
import { useToast } from "@context/ToastContext"
import { products } from "@data/products"
import { formatNaira, formatDate } from "@lib/format"
import { cn } from "@lib/utils"

export function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { getOrder, cancelOrder } = useOrders()
  const { success, error } = useToast()

  const order = getOrder(id ?? "")

  if (!order) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={AlertCircle}
          title="Order not found"
          description="We couldn't locate this order in your FreshCart account. It may have been placed under another ID or session."
          action={{ label: "View all orders", href: "/orders" }}
        />
      </div>
    )
  }

  const handleReorder = () => {
    let count = 0
    order.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (product) {
        addItem(product, item.quantity)
        count++
      }
    })
    success("Items Added", `${count} items from ${order.orderNumber} added to cart.`)
    navigate("/cart")
  }

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel this order?")) {
      cancelOrder(order.id, "Customer requested cancellation before dispatch.")
    }
  }

  const riderInfo = order.riderName ? (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900">Assigned Dispatch Rider</h3>
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
          En Route
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-700 text-white shadow-xs">
          <Truck className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold text-slate-900">{order.riderName}</p>
          <p className="text-xs text-slate-600">FreshCart Express Logistics · Motorcycle Unit</p>
        </div>
      </div>
    </div>
  ) : null

  return (
    <div className="container py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-emerald-700">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/orders" className="hover:text-emerald-700">Orders</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-bold text-slate-900">{order.orderNumber}</span>
      </nav>

      {/* Header Banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900">{order.orderNumber}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Placed on {formatDate(order.createdAt)} · Delivery: {order.deliverySlot}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <XCircle className="h-4 w-4 mr-1 text-rose-500" />
              Cancel Order
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleReorder}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Re-order All
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Main tracking & items column */}
        <div className="space-y-6">
          {/* Timeline */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Delivery Status &amp; Progress</h2>
                <p className="text-xs text-slate-500 mt-0.5">Real-time status updates from our fulfillment hub</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                {order.status.replace(/_/g, " ")}
              </span>
            </div>
            <OrderTimeline events={order.timeline} className="mt-6" />
          </section>

          {/* Rider Info if available */}
          {riderInfo}

          {/* Ordered Groceries List with Real Images */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">
              Ordered Grocery Items ({order.items.length})
            </h2>
            <div className="mt-4 divide-y divide-slate-100">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 py-3.5">
                  <div className="flex items-center gap-3.5">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <ProductImage
                        productName={it.name}
                        imageUrl={it.imageUrl}
                        className="h-full w-full object-cover"
                        size="sm"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{it.name}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        {it.unit} · {it.brand}
                      </p>
                      {it.substitutionNote && (
                        <p className="mt-0.5 text-xs text-amber-700">
                          Note: {it.substitutionNote}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold text-slate-900">
                      {formatNaira(it.price * it.quantity)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatNaira(it.price)} × {it.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Address & Payment cards */}
          <div className="grid gap-6 sm:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <MapPin className="h-4 w-4 text-emerald-700" /> Delivery Address
              </h3>
              <div className="mt-3 text-xs leading-relaxed text-slate-600">
                <p className="font-bold text-slate-900">{order.address.fullName}</p>
                <p>{order.address.phone}</p>
                <p className="mt-1">{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>{order.address.city}, {order.address.state}</p>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <CreditCard className="h-4 w-4 text-emerald-700" /> Payment Summary
              </h3>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Method</dt>
                  <dd className="font-bold text-slate-900">{order.paymentMethod}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-slate-500">Status</dt>
                  <dd><PaymentStatusBadge status={order.paymentStatus} /></dd>
                </div>
                {order.couponCode && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Promo Code</dt>
                    <dd className="font-mono font-bold text-emerald-800">{order.couponCode}</dd>
                  </div>
                )}
              </dl>
            </section>
          </div>

          {order.deliveryNotes && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm">Customer Delivery Instructions</h3>
              <p className="mt-1.5 text-xs text-slate-600">{order.deliveryNotes}</p>
            </section>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Receipt
            </h3>
            <div className="mt-4">
              <CheckoutSummary
                subtotal={order.subtotal}
                deliveryFee={order.deliveryFee}
                discount={order.discount}
                total={order.total}
                itemCount={order.items.reduce((s, i) => s + i.quantity, 0)}
              />
            </div>

            <div className="mt-6 space-y-2.5">
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => {
                  success("Receipt Ready", "Print receipt prepared.")
                  window.print()
                }}
              >
                <FileText className="h-4 w-4 mr-1.5" />
                Print Order Receipt
              </Button>
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => navigate("/account")}
              >
                Return to Account
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
