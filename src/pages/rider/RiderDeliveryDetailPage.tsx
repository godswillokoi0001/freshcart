import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronLeft, MapPin, Phone, Navigation, Package, CheckCircle2, Clock, AlertCircle, ArrowRight, ArrowLeft, User } from "lucide-react"
import { Button } from "@components/ui/Button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@components/ui/AlertDialog"
import { deliveries } from "@data/people"
import { DeliveryStatusBadge } from "@components/shared/StatusBadges"
import { formatNaira } from "@lib/format"
import { cn } from "@lib/utils"

const statusFlow = ["UNASSIGNED", "ASSIGNED", "ACCEPTED", "GO_TO_STORE", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"] as const

export function RiderDeliveryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const delivery = deliveries.find((d) => d.id === id)

  if (!delivery) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-bold text-navy-900">Delivery not found</h1>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/rider/deliveries")}><ChevronLeft className="h-4 w-4" /> Back</Button>
      </div>
    )
  }

  const currentIndex = Math.max(0, statusFlow.indexOf(delivery.status as typeof statusFlow[number]))
  const [showComplete, setShowComplete] = React.useState(false)
  const [showProof, setShowProof] = React.useState(false)
  const [signature, setSignature] = React.useState("")

  const nextStatus = () => {
    if (currentIndex < statusFlow.length - 1) {
      const next = statusFlow[currentIndex + 1]
      if (next === "DELIVERED") setShowProof(true)
      else alert(`Status updated to ${next} (demo)`)
    }
  }

  const handleComplete = () => {
    alert(`Delivery ${delivery.orderId} marked as DELIVERED (demo)`)
    navigate("/rider/deliveries")
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/rider/deliveries")}><ChevronLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-xl font-bold text-navy-900">{delivery.orderId}</h1>
          <p className="text-sm text-navy-500">{delivery.customerName} · {delivery.area}</p>
        </div>
        <div className="ml-auto"><DeliveryStatusBadge status={delivery.status} /></div>
      </div>

      <div className="grid gap-4">
        <section className="rounded-lg border border-navy-200 bg-white p-4">
          <h2 className="font-semibold text-navy-900">Customer Details</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center gap-2"><User className="h-4 w-4 text-navy-400" /><span>{delivery.customerName}</span></div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-navy-400" /><span>{delivery.customerPhone}</span></div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-navy-400" /><span>{delivery.address}</span></div>
            {delivery.deliveryNotes && <div className="flex items-start gap-2"><Package className="h-4 w-4 text-navy-400" /><span className="text-navy-600">{delivery.deliveryNotes}</span></div>}
          </div>
        </section>

        <section className="rounded-lg border border-navy-200 bg-white p-4">
          <h2 className="font-semibold text-navy-900">Status</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {statusFlow.map((s, i) => (
              <span
                key={s}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
                  i < currentIndex ? "bg-fresh-100 text-fresh-700" :
                  i === currentIndex ? "bg-fresh-500 text-white" :
                  "bg-navy-100 text-navy-400"
                )}
              >
                {i < currentIndex && <CheckCircle2 className="h-3 w-3" />}
                {s.replace("_", " ")}
              </span>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={nextStatus} disabled={currentIndex >= statusFlow.length - 1} className="flex-1">
              {currentIndex >= statusFlow.length - 1 ? "Delivered" : `Mark as ${statusFlow[currentIndex + 1].replace("_", " ")}`}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => alert("Contact support (demo)")}>
              <AlertCircle className="h-4 w-4" /> Issue
            </Button>
          </div>
        </section>

        <section className="rounded-lg border border-navy-200 bg-white p-4">
          <h2 className="font-semibold text-navy-900">Delivery Details</h2>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
            <dt className="text-navy-500">Items</dt><dd className="font-medium text-navy-900">{delivery.itemsCount}</dd>
            <dt className="text-navy-500">Delivery Fee</dt><dd className="font-medium text-navy-900">{formatNaira(delivery.deliveryFee)}</dd>
            <dt className="text-navy-500">Assigned</dt><dd className="font-medium text-navy-900">{delivery.assignedAt ? new Date(delivery.assignedAt).toLocaleTimeString() : "—"}</dd>
          </dl>
        </section>

        <section className="rounded-lg border border-navy-200 bg-white p-4">
          <h2 className="font-semibold text-navy-900">Navigation</h2>
          <p className="mt-2 text-sm text-navy-500">Map integration would appear here. Connect Google Maps API in production.</p>
          <div className="mt-3 h-48 rounded-lg border border-navy-200 bg-navy-50 flex items-center justify-center">
            <MapPin className="h-12 w-12 text-navy-300" />
          </div>
          <Button variant="outline" className="mt-3 w-full" onClick={() => alert("Opening navigation (demo)")}>
            <Navigation className="h-4 w-4" /> Open in Maps
          </Button>
        </section>
      </div>

      <AlertDialog open={showProof} onOpenChange={setShowProof}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Proof of Delivery</AlertDialogTitle>
            <AlertDialogDescription>Confirm delivery with customer signature or photo.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700">Customer Signature</label>
              <div className="mt-2 h-32 rounded-lg border-2 border-dashed border-navy-200 bg-navy-50 flex items-center justify-center text-navy-400">
                {signature ? <span className="text-navy-900 font-medium">Signed</span> : "Tap to sign"}
              </div>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setSignature("signed")}>Sign Here</Button>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700">Photo Proof (optional)</label>
              <Button variant="outline" size="sm" className="mt-2 w-full"><AlertCircle className="h-4 w-4" /> Take Photo</Button>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowProof(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete}>Confirm Delivery</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
