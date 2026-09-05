import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ChevronLeft,
  MapPin,
  Phone,
  Navigation,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  User,
  Bike,
  Check,
  Eraser,
  ExternalLink,
} from "lucide-react"
import { Button } from "@components/ui/Button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/AlertDialog"
import { useToast } from "@context/ToastContext"
import { useOrders } from "@context/OrdersContext"
import { DeliveryStatusBadge } from "@components/shared/StatusBadges"
import { formatNaira, formatDate } from "@lib/format"
import { cn } from "@lib/utils"
import type { OrderStatus } from "@app-types/index"

const riderStepMap: { step: string; orderStatus: OrderStatus }[] = [
  { step: "ASSIGNED", orderStatus: "PREPARING" },
  { step: "GO_TO_STORE", orderStatus: "PACKED" },
  { step: "PICKED_UP", orderStatus: "READY_FOR_PICKUP" },
  { step: "OUT_FOR_DELIVERY", orderStatus: "OUT_FOR_DELIVERY" },
  { step: "DELIVERED", orderStatus: "DELIVERED" },
]

export function RiderDeliveryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { success, error } = useToast()
  const { orders, updateOrderStatus } = useOrders()

  // Find corresponding order
  const order = orders.find(
    (o) =>
      o.id === id ||
      `del-${o.id}` === id ||
      o.orderNumber === id ||
      `del-${o.orderNumber}` === id
  )

  const [showProof, setShowProof] = React.useState(false)
  const [signatureData, setSignatureData] = React.useState<string | null>(null)
  const [isDrawing, setIsDrawing] = React.useState(false)
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

  if (!order) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">Delivery not found</h1>
        <p className="text-xs text-slate-500 mt-1">This delivery assignment could not be found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/rider/deliveries")}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Deliveries
        </Button>
      </div>
    )
  }

  // Derive rider step index based on order status
  let currentStepIdx = 0
  if (order.status === "DELIVERED") currentStepIdx = 4
  else if (order.status === "OUT_FOR_DELIVERY") currentStepIdx = 3
  else if (order.status === "READY_FOR_PICKUP") currentStepIdx = 2
  else if (order.status === "PACKED") currentStepIdx = 1
  else currentStepIdx = 0

  const advanceDeliveryStep = () => {
    if (currentStepIdx === 3) {
      // Prompt for proof of delivery before finishing
      setShowProof(true)
      return
    }
    const next = riderStepMap[currentStepIdx + 1]
    if (next) {
      updateOrderStatus(order.id, next.orderStatus)
      success("Status Updated", `Delivery status advanced to ${next.step.replace(/_/g, " ")}.`)
    }
  }

  const handleCompleteDelivery = () => {
    if (!signatureData) {
      error("Signature Required", "Please have the recipient sign on screen to confirm receipt.")
      return
    }
    updateOrderStatus(order.id, "DELIVERED")
    setShowProof(false)
    success("Delivery Completed", `Order #${order.orderNumber} successfully delivered!`)
  }

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    ctx.lineWidth = 2.5
    ctx.lineCap = "round"
    ctx.strokeStyle = "#047857" // Emerald
    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      setSignatureData(canvas.toDataURL())
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignatureData(null)
  }

  const fullAddress = `${order.address.line1}${order.address.line2 ? `, ${order.address.line2}` : ""}, ${order.address.city}, ${order.address.state}`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`

  return (
    <div className="space-y-4 pb-20">
      {/* Header bar */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/rider/deliveries")}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">{order.orderNumber}</h1>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
              {riderStepMap[currentStepIdx].step.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {order.customerName} · {order.address.city}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Customer contact & instructions card */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="font-bold text-slate-900 text-sm">Customer &amp; Drop-off Details</h2>
          <div className="mt-3 space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700">
              <User className="h-4 w-4 text-emerald-700 shrink-0" />
              <span className="font-bold text-slate-900">{order.customerName}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-slate-700">
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>{order.customerPhone}</span>
              </div>
              <a
                href={`tel:${order.customerPhone}`}
                className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
              >
                <Phone className="h-3 w-3 mr-1" /> Call Customer
              </a>
            </div>
            <div className="flex items-start gap-2.5 text-slate-700">
              <MapPin className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{fullAddress}</span>
            </div>
            {order.deliveryNotes && (
              <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 p-2 text-amber-900">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
                <span>Note: {order.deliveryNotes}</span>
              </div>
            )}
          </div>
        </section>

        {/* Step Progress & Action Card */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="font-bold text-slate-900 text-sm">Trip Progression</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {riderStepMap.map((s, i) => (
              <span
                key={s.step}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                  i < currentStepIdx
                    ? "bg-emerald-100 text-emerald-800"
                    : i === currentStepIdx
                    ? "bg-emerald-700 text-white font-bold"
                    : "bg-slate-100 text-slate-400"
                )}
              >
                {i < currentStepIdx && <Check className="h-3 w-3" />}
                {s.step.replace(/_/g, " ")}
              </span>
            ))}
          </div>

          <div className="mt-5 flex gap-2">
            <Button
              onClick={advanceDeliveryStep}
              disabled={currentStepIdx >= 4}
              className="flex-1"
            >
              {currentStepIdx === 3
                ? "Complete Delivery & Collect Signature"
                : currentStepIdx >= 4
                ? "Delivery Completed ✓"
                : `Advance to ${riderStepMap[currentStepIdx + 1]?.step.replace(/_/g, " ")}`}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </section>
      </div>

      {/* Interactive Turn-by-turn Navigation Card */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-emerald-700" />
            <h2 className="font-bold text-slate-900 text-sm">Transit Route to Destination</h2>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
            Est. 18 mins (4.6 km)
          </span>
        </div>

        {/* Visual Map/Route Blueprint */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
            <span>FreshCart Hub (Ikeja Fulfillment)</span>
            <span>{order.address.city} Customer Gate</span>
          </div>

          {/* Graphical Route bar */}
          <div className="relative flex items-center justify-between py-2">
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                style={{ width: `${(currentStepIdx / 4) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Dispatched</span>
            <span>En Route via Major Arterial</span>
            <span>Arrived</span>
          </div>
        </div>

        <div className="mt-4">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Navigation className="h-4 w-4 text-emerald-700" />
            Open Navigation in Google Maps
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </a>
        </div>
      </section>

      {/* Ordered Items Preview for Rider Verification */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="font-bold text-slate-900 text-sm">
          Grocery Package Contents ({order.items.length} items)
        </h2>
        <div className="mt-3 divide-y divide-slate-100 text-xs">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2.5">
              <div>
                <p className="font-bold text-slate-900">{item.name}</p>
                <p className="text-slate-500">{item.unit} · {item.brand}</p>
              </div>
              <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                Qty: {item.quantity}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Signature & Proof Dialog */}
      <AlertDialog open={showProof} onOpenChange={setShowProof}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Recipient Proof of Delivery</AlertDialogTitle>
            <AlertDialogDescription>
              Have customer <span className="font-bold text-slate-900">{order.customerName}</span> draw their signature below to confirm order receipt.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-3 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Digital Signature Pad</label>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                >
                  <Eraser className="h-3 w-3" /> Clear
                </button>
              </div>

              <div className="rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/30 p-1">
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={140}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="touch-none w-full h-36 bg-white rounded-lg cursor-crosshair"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400 text-center">
                Draw signature using finger on mobile or mouse pointer
              </p>
            </div>
          </div>

          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel onClick={() => setShowProof(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteDelivery}>
              Confirm Delivery ✓
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
