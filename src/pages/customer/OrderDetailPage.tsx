import { Link, useParams } from "react-router-dom"
import { ChevronRight, MapPin, Phone, CreditCard, Clock, Truck, Package, User, AlertCircle, CheckCircle2, RotateCcw } from "lucide-react"
import { Button } from "@components/ui/Button"
import { EmptyState } from "@components/ui/EmptyState"
import { OrderTimeline } from "@components/customer/OrderTimeline"
import { CheckoutSummary } from "@components/customer/CheckoutSummary"
import { OrderStatusBadge, PaymentStatusBadge } from "@components/shared/StatusBadges"
import { orderById } from "@data/orders"
import { formatNaira, formatDate } from "@lib/format"
import { cn } from "@lib/utils"

const statusIcons = {
  "Order placed": <Package className="h-4 w-4" />,
  "Payment confirmed": <CreditCard className="h-4 w-4" />,
  "Order confirmed": <CheckCircle2 className="h-4 w-4" />,
  "Being prepared": <RotateCcw className="h-4 w-4" />,
  Packed: <Package className="h-4 w-4" />,
  "Rider assigned": <User className="h-4 w-4" />,
  "Out for delivery": <Truck className="h-4 w-4" />,
  Delivered: <CheckCircle2 className="h-4 w-4" />,
}

export function OrderDetailPage() {
  const { id } = useParams()
  const order = orderById(id ?? "")

  if (!order) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={AlertCircle}
          title="Order not found"
          description="This order may have been removed or the link is incorrect."
          action={{ label: "Back to orders", href: "/orders" }}
        />
      </div>
    )
  }

  const riderInfo = order.riderName ? (
    <div className="mt-4 rounded-lg border border-navy-200 p-4">
      <h3 className="font-semibold text-navy-900">Your Rider</h3>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fresh-50 text-fresh-700">
          <Truck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-navy-900">{order.riderName}</p>
          <p className="text-xs text-navy-500">Assigned to your delivery</p>
        </div>
      </div>
    </div>
  ) : null

  return (
    <div className="container py-8">
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-navy-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-fresh-700">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/orders" className="hover:text-fresh-700">Orders</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-navy-900">{order.orderNumber}</span>
      </nav>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy-900">{order.orderNumber}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-navy-500">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/account">View in Account</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-navy-200 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-navy-900">Order Timeline</h2>
              <p className="text-sm text-navy-500">{order.status}</p>
            </div>
            <OrderTimeline events={order.timeline} className="mt-4" />
          </section>

          <section className="rounded-lg border border-navy-200 p-6">
            <h2 className="text-lg font-semibold text-navy-900">Order Items</h2>
            <div className="mt-4 divide-y divide-navy-100">
              {order.items.map((item, i) => (
                <div key={i} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-400">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy-900">{item.name}</p>
                      <p className="text-xs text-navy-500">{item.unit} · {item.brand}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-navy-900">{formatNaira(item.price * item.quantity)}</p>
                    <p className="text-xs text-navy-500">{formatNaira(item.price)} each × {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-6 sm:grid-cols-2">
            <section className="rounded-lg border border-navy-200 p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-navy-900">
                <MapPin className="h-5 w-5 text-navy-400" /> Delivery Address
              </h2>
              <address className="mt-3 not-italic text-sm text-navy-600">
                {order.address.fullName} · {order.address.phone}<br />
                {order.address.line1}
                {order.address.line2 && <>{", "}{order.address.line2}</>}<br />
                {order.address.city}, {order.address.state}
              </address>
            </section>

            <section className="rounded-lg border border-navy-200 p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-navy-900">
                <CreditCard className="h-5 w-5 text-navy-400" /> Payment
              </h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-navy-500">Method</dt><dd className="font-medium text-navy-900">{order.paymentMethod}</dd></div>
                <div className="flex justify-between"><dt className="text-navy-500">Status</dt><dd><PaymentStatusBadge status={order.paymentStatus} /></dd></div>
                {order.couponCode && <div className="flex justify-between"><dt className="text-navy-500">Coupon</dt><dd className="font-medium text-navy-900">{order.couponCode}</dd></div>}
              </dl>
            </section>
          </div>

          {order.deliveryNotes && (
            <section className="rounded-lg border border-navy-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900">Delivery Notes</h2>
              <p className="mt-2 text-sm text-navy-600">{order.deliveryNotes}</p>
            </section>
          )}

          {riderInfo}
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-lg border border-navy-200 p-6">
            <CheckoutSummary
              subtotal={order.subtotal}
              deliveryFee={order.deliveryFee}
              discount={order.discount}
              total={order.total}
              itemCount={order.items.reduce((s, i) => s + i.quantity, 0)}
            />
            {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
              <Button size="lg" className="mt-4 w-full" onClick={() => alert("Contact support feature coming soon")}>
                Contact Support
              </Button>
            )}
            {order.status === "DELIVERED" && (
              <Button size="lg" variant="secondary" className="mt-4 w-full">
                <RotateCcw className="h-4 w-4" /> Reorder
              </Button>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
