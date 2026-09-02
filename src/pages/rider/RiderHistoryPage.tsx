import { Package, CheckCircle2, MapPin, Clock } from "lucide-react"
import { Badge } from "@components/ui/Badge"
import { deliveries, riderHistory } from "@data/people"
import { formatNaira, formatDateTime } from "@lib/format"
import { cn } from "@lib/utils"

export function RiderHistoryPage() {
  const completed = riderHistory.filter((d) => d.status === "DELIVERED")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Delivery History</h1>
        <p className="mt-1 text-sm text-navy-500">{completed.length} completed deliveries</p>
      </div>

      <div className="space-y-3">
        {completed.map((d) => (
          <div key={d.id} className="rounded-lg border border-navy-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50"><CheckCircle2 className="h-5 w-5 text-success-600" /></div>
                <div>
                  <p className="font-medium text-navy-900">{d.orderId}</p>
                  <p className="text-sm text-navy-500">{d.area} · {formatNaira(d.deliveryFee)}</p>
                </div>
              </div>
              <Badge variant="success">Delivered</Badge>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
              <div><dt className="text-navy-500">Date</dt><dd className="font-medium text-navy-900">{formatDateTime(d.assignedAt ?? new Date().toISOString())}</dd></div>
              <div><dt className="text-navy-500">Items</dt><dd className="font-medium text-navy-900">{d.itemsCount}</dd></div>
              <div><dt className="text-navy-500">Fee</dt><dd className="font-medium text-navy-900">{formatNaira(d.deliveryFee)}</dd></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
