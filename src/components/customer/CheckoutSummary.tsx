import type { ReactNode } from "react"
import { formatNaira } from "@lib/format"
import { Separator } from "@components/ui/Separator"
import { cn } from "@lib/utils"

export function CheckoutSummary({
  subtotal,
  deliveryFee,
  discount,
  total,
  freeDeliveryThreshold,
  itemCount,
  children,
  className,
}: {
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  freeDeliveryThreshold?: number
  itemCount?: number
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-lg border border-navy-200 bg-white p-6 shadow-sm", className)}>
      <h2 className="text-base font-semibold text-navy-900">Order Summary</h2>
      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-navy-500">Subtotal{itemCount !== undefined ? ` (${itemCount} items)` : ""}</dt>
          <dd className="font-medium text-navy-900">{formatNaira(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-navy-500">Delivery</dt>
          <dd className={cn("font-medium", deliveryFee === 0 ? "text-success-600" : "text-navy-900")}>
            {deliveryFee === 0 ? "Free" : formatNaira(deliveryFee)}
          </dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-navy-500">Discount</dt>
            <dd className="font-medium text-success-600">−{formatNaira(discount)}</dd>
          </div>
        )}
      </dl>
      <Separator className="my-4" />
      <div className="flex items-baseline justify-between">
        <span className="text-base font-semibold text-navy-900">Total</span>
        <span className="text-xl font-bold text-navy-900">{formatNaira(total)}</span>
      </div>
      {freeDeliveryThreshold && subtotal < freeDeliveryThreshold && (
        <p className="mt-3 rounded-md bg-fresh-50 px-3 py-2 text-xs text-fresh-800">
          Spend {formatNaira(freeDeliveryThreshold - subtotal)} more to unlock free delivery.
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
