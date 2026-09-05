import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronLeft, Package, AlertTriangle, Minus, Plus, Check, RotateCcw, User, MapPin, CreditCard, Clock, Truck } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Badge } from "@components/ui/Badge"
import { Separator } from "@components/ui/Separator"
import { useOrders } from "@context/OrdersContext"
import { OrderStatusBadge, PaymentStatusBadge } from "@components/shared/StatusBadges"
import { ProductImage } from "@components/shared/ProductImage"
import { formatNaira, formatDate } from "@lib/format"
import { cn } from "@lib/utils"
import { useToast } from "@context/ToastContext"
import type { OrderStatus } from "@app-types/index"

const statusFlow: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "PACKED",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
]

export function StaffOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { success, error } = useToast()
  const { getOrder, updateOrderStatus, updateOrderItemStatus, assignRider } = useOrders()

  const order = getOrder(id ?? "")

  const [picked, setPicked] = React.useState<Record<string, "PICKED" | "OUT_OF_STOCK" | "SUBSTITUTED">>({})
  const [subNotes, setSubNotes] = React.useState<Record<string, string>>({})
  const [selectedRider, setSelectedRider] = React.useState(order?.riderName ?? "Michael Eze")

  React.useEffect(() => {
    if (order) {
      const initialPicked: Record<string, "PICKED" | "OUT_OF_STOCK" | "SUBSTITUTED"> = {}
      const initialNotes: Record<string, string> = {}
      order.items.forEach((it) => {
        if (it.pickedStatus) initialPicked[it.productId] = it.pickedStatus
        if (it.substitutionNote) initialNotes[it.productId] = it.substitutionNote
      })
      setPicked(initialPicked)
      setSubNotes(initialNotes)
    }
  }, [order])

  if (!order) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">Order not found</h1>
        <p className="mt-2 text-sm text-slate-500">The requested order does not exist or has been removed.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/staff/orders")}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Orders
        </Button>
      </div>
    )
  }

  const currentIndex = statusFlow.indexOf(order.status)

  const advanceStage = () => {
    if (currentIndex < statusFlow.length - 2) {
      const next = statusFlow[currentIndex + 1]
      updateOrderStatus(order.id, next)
    }
  }

  const handlePick = (productId: string, status: "PICKED" | "OUT_OF_STOCK") => {
    setPicked((p) => ({ ...p, [productId]: status }))
    let note = ""
    if (status === "OUT_OF_STOCK") {
      const input = prompt("Enter suggested substitute product name (optional):")
      if (input) {
        note = input
        setSubNotes((s) => ({ ...s, [productId]: input }))
      }
    }
    updateOrderItemStatus(order.id, productId, status, note || undefined)
  }

  const handleAssignRider = () => {
    const riderId = selectedRider === "Michael Eze" ? "rider-1" : selectedRider === "David Okafor" ? "rider-2" : "rider-3"
    assignRider(order.id, riderId, selectedRider)
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/staff/orders")}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">{order.orderNumber}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-xs text-slate-500">
            {order.customerName} · {formatDate(order.createdAt)} · {order.customerPhone}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            onClick={advanceStage}
            disabled={currentIndex >= statusFlow.length - 2 || order.status === "CANCELLED"}
          >
            Advance to Next Stage
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateOrderStatus(order.id, "READY_FOR_PICKUP")}
          >
            Mark Ready for Pickup
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left Column: Items picking & workflow */}
        <div className="space-y-6">
          {/* Items Picking Card */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-bold text-slate-900">Grocery Packing List ({order.items.length})</h2>
                <p className="text-xs text-slate-500">Check each product into the fulfillment tote</p>
              </div>
              <span className="text-xs font-semibold text-emerald-800">
                {Object.values(picked).filter((s) => s === "PICKED").length} of {order.items.length} Picked
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {order.items.map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <ProductImage
                        productName={item.name}
                        imageUrl={item.imageUrl}
                        className="h-full w-full object-cover"
                        size="sm"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.brand} · {item.unit}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-sm whitespace-nowrap">
                        {formatNaira(item.price * item.quantity)}
                      </p>
                      <span className="text-xs text-slate-400">Qty: {item.quantity}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={picked[item.productId] === "PICKED" ? "success" : "default"}>
                        {picked[item.productId] ? picked[item.productId] : "Pending"}
                      </Badge>
                      <select
                        value={picked[item.productId] ?? ""}
                        onChange={(e) => handlePick(item.productId, e.target.value as any)}
                        className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="">Action</option>
                        <option value="PICKED">✓ Picked</option>
                        <option value="OUT_OF_STOCK">⚠ Out of Stock</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {Object.entries(subNotes).length > 0 && (
              <div className="border-t border-slate-100 p-4 bg-amber-50/60 rounded-b-xl">
                <p className="font-bold text-amber-900 text-xs">Customer Substitutions</p>
                <ul className="mt-1 space-y-1 text-xs">
                  {Object.entries(subNotes).map(([pid, note]) => (
                    <li key={pid} className="text-amber-800">
                      Product ID {pid}: <span className="font-medium">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Status Workflow Progress */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="font-bold text-slate-900 text-sm">Fulfillment Stage Progression</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {statusFlow.map((s, i) => (
                <span
                  key={s}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    i < currentIndex ? "bg-emerald-100 text-emerald-800" :
                    i === currentIndex ? "bg-emerald-700 text-white font-bold" :
                    "bg-slate-100 text-slate-400"
                  )}
                >
                  {i < currentIndex && <Check className="h-3 w-3" />}
                  {s.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Customer & Delivery Info */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Dispatch Assignment */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-700" /> Dispatch Assignment
            </h3>
            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-600">Assign Delivery Rider</label>
              <div className="mt-1 flex gap-2">
                <select
                  value={selectedRider}
                  onChange={(e) => setSelectedRider(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-500"
                >
                  <option value="Michael Eze">Michael Eze (VI / Lekki)</option>
                  <option value="David Okafor">David Okafor (Ikeja / Maryland)</option>
                  <option value="Emmanuel Bello">Emmanuel Bello (Yaba / Surulere)</option>
                </select>
                <Button size="sm" onClick={handleAssignRider}>
                  Assign
                </Button>
              </div>
              {order.riderName && (
                <p className="mt-2 text-xs text-emerald-800 font-medium">
                  Currently Assigned: <span className="font-bold">{order.riderName}</span>
                </p>
              )}
            </div>
          </section>

          {/* Order Summary & Financials */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm">Customer &amp; Payment</h3>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-slate-500">Customer</dt>
                <dd className="font-bold text-slate-900">{order.customerName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Phone</dt>
                <dd className="font-semibold text-slate-900">{order.customerPhone}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Delivery Slot</dt>
                <dd className="font-medium text-slate-900">{order.deliverySlot}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Payment</dt>
                <dd className="font-medium text-slate-900">{order.paymentMethod}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-slate-500">Payment Status</dt>
                <dd><PaymentStatusBadge status={order.paymentStatus} /></dd>
              </div>
            </dl>

            <Separator className="my-3" />

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="font-medium text-slate-900">{formatNaira(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Delivery</dt>
                <dd className="font-medium text-slate-900">{formatNaira(order.deliveryFee)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>Discount</dt>
                  <dd>−{formatNaira(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-sm text-slate-900">
                <dt>Total</dt>
                <dd>{formatNaira(order.total)}</dd>
              </div>
            </div>
          </section>

          {/* Delivery Address */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm">Delivery Destination</h3>
            <div className="mt-2 text-xs text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-900">{order.address.fullName}</p>
              <p>{order.address.phone}</p>
              <p>{order.address.line1}</p>
              {order.address.line2 && <p>{order.address.line2}</p>}
              <p>{order.address.city}, {order.address.state}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
