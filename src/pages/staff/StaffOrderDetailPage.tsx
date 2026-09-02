import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronLeft, Package, AlertTriangle, Minus, Plus, Check, RotateCcw, User, MapPin, CreditCard, Clock } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Badge } from "@components/ui/Badge"
import { Separator } from "@components/ui/Separator"
import { adminOrders } from "@data/admin-orders"
import { OrderStatusBadge } from "@components/shared/StatusBadges"
import { PaymentStatusBadge } from "@components/shared/StatusBadges"
import { formatNaira, formatDate } from "@lib/format"
import { cn } from "@lib/utils"

const statusFlow = ["PENDING", "CONFIRMED", "PREPARING", "PACKED", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as const

export function StaffOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const order = adminOrders.find((o) => o.id === id)

  if (!order) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-xl font-bold text-navy-900">Order not found</h1>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/staff/orders")}>
          <ChevronLeft className="h-4 w-4" /> Back to Orders
        </Button>
      </div>
    )
  }

  const currentIndex = statusFlow.indexOf(order.status)
  const [picked, setPicked] = React.useState<Record<string, "PICKED" | "OUT_OF_STOCK" | "SUBSTITUTED">>({})
  const [subNotes, setSubNotes] = React.useState<Record<string, string>>({})

  const nextStatus = () => {
    if (currentIndex < statusFlow.length - 1) {
      alert(`Order status would advance to ${statusFlow[currentIndex + 1]} (demo)`)
    }
  }

  const handlePick = (productId: string, status: "PICKED" | "OUT_OF_STOCK") => {
    setPicked((p) => ({ ...p, [productId]: status }))
    if (status === "OUT_OF_STOCK") {
      const sub = prompt("Enter substitute product name (optional):")
      if (sub) setSubNotes((s) => ({ ...s, [productId]: sub }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/staff/orders")}><ChevronLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-xl font-bold text-navy-900">{order.orderNumber}</h1>
          <p className="text-sm text-navy-500">{order.customerName} · {formatDate(order.createdAt)}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-navy-200 bg-white">
            <div className="border-b border-navy-100 px-4 py-3">
              <h2 className="font-semibold text-navy-900">Items</h2>
            </div>
            <div className="divide-y divide-navy-100">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-navy-50"><Package className="h-6 w-6 text-navy-400" /></div>
                    <div className="min-w-0">
                      <p className="font-medium text-navy-900 truncate">{item.name}</p>
                      <p className="text-sm text-navy-500">{item.brand} · {item.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-navy-900 whitespace-nowrap">{formatNaira(item.price * item.quantity)}</p>
                    <span className="text-sm text-navy-500">× {item.quantity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={picked[item.productId] === "PICKED" ? "success" : "default"}>
                      {picked[item.productId] ? picked[item.productId] : "—"}
                    </Badge>
                    <select
                      value={picked[item.productId] ?? ""}
                      onChange={(e) => handlePick(item.productId, e.target.value as any)}
                      className="h-8 w-28 rounded-md border border-navy-200 bg-white px-2 py-1 text-xs focus:border-fresh-500 focus:outline-none focus:ring-1 focus:ring-fresh-500"
                    >
                      <option value="">— Action —</option>
                      <option value="PICKED">✓ Picked</option>
                      <option value="OUT_OF_STOCK">⚠ Out of Stock</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            {Object.entries(subNotes).length > 0 && (
              <div className="border-t border-navy-100 p-4 bg-navy-50">
                <p className="font-medium text-navy-900">Substitutions</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {Object.entries(subNotes).map(([pid, note]) => (
                    <li key={pid} className="flex items-center gap-2 text-navy-600">
                      <RotateCcw className="h-4 w-4 text-warning-600" />
                      <span>Substitute for {pid}: {note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-navy-200 bg-white p-6">
            <h2 className="font-semibold text-navy-900">Status Workflow</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {statusFlow.map((s, i) => (
                <span
                  key={s}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    i < currentIndex ? "bg-fresh-100 text-fresh-700" :
                    i === currentIndex ? "bg-fresh-500 text-white" :
                    "bg-navy-100 text-navy-400"
                  )}
                >
                  {i < currentIndex && <Check className="h-3 w-3" />}
                  {s.replace("_", " ")}
                </span>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={nextStatus} disabled={currentIndex >= statusFlow.length - 1}>
                Advance to Next Stage
              </Button>
              <Button variant="outline" onClick={() => alert("Mark ready for pickup (demo)")}>
                Mark Ready for Pickup
              </Button>
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-lg border border-navy-200 bg-white p-6">
            <h2 className="font-semibold text-navy-900">Order Summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-navy-500">Customer</dt><dd className="font-medium text-navy-900">{order.customerName}</dd></div>
              <div className="flex justify-between"><dt className="text-navy-500">Phone</dt><dd className="font-medium text-navy-900">{order.customerPhone}</dd></div>
              <div className="flex justify-between"><dt className="text-navy-500">Delivery Slot</dt><dd className="font-medium text-navy-900">{order.deliverySlot}</dd></div>
              <div className="flex justify-between"><dt className="text-navy-500">Payment</dt><dd className="font-medium text-navy-900">{order.paymentMethod}</dd></div>
              <div className="flex justify-between"><dt className="text-navy-500">Payment Status</dt><dd><PaymentStatusBadge status={order.paymentStatus} /></dd></div>
            </dl>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-navy-500">Subtotal</dt><dd className="font-medium text-navy-900">{formatNaira(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-navy-500">Delivery</dt><dd className="font-medium text-navy-900">{formatNaira(order.deliveryFee)}</dd></div>
              {order.discount > 0 && <div className="flex justify-between"><dt className="text-navy-500">Discount</dt><dd className="font-medium text-success-600">−{formatNaira(order.discount)}</dd></div>}
              <div className="flex justify-between border-t border-navy-100 pt-2"><dt className="font-semibold text-navy-900">Total</dt><dd className="font-bold text-navy-900">{formatNaira(order.total)}</dd></div>
            </div>
          </section>

          <section className="rounded-lg border border-navy-200 bg-white p-6">
            <h2 className="font-semibold text-navy-900">Delivery Address</h2>
            <address className="mt-3 not-italic text-sm text-navy-600">
              {order.address.fullName} · {order.address.phone}<br />
              {order.address.line1}
              {order.address.line2 && <>{", "}{order.address.line2}</>}<br />
              {order.address.city}, {order.address.state}
            </address>
          </section>

          {order.deliveryNotes && (
            <section className="rounded-lg border border-navy-200 bg-white p-6">
              <h2 className="font-semibold text-navy-900">Delivery Notes</h2>
              <p className="mt-2 text-sm text-navy-600">{order.deliveryNotes}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
