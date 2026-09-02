import type { OrderStatus, PaymentStatus, StockStatus, RiderStatus, Delivery } from "@app-types/index"
import { Badge } from "@components/ui/Badge"

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; variant: "success" | "warning" | "info" | "destructive" | "default" }> = {
    PENDING: { label: "Pending", variant: "default" },
    CONFIRMED: { label: "Confirmed", variant: "info" },
    PREPARING: { label: "Preparing", variant: "warning" },
    PACKED: { label: "Packed", variant: "info" },
    READY_FOR_PICKUP: { label: "Ready for pickup", variant: "warning" },
    OUT_FOR_DELIVERY: { label: "Out for delivery", variant: "info" },
    DELIVERED: { label: "Delivered", variant: "success" },
    CANCELLED: { label: "Cancelled", variant: "destructive" },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, { label: string; variant: "success" | "warning" | "default" }> = {
    PAID: { label: "Paid", variant: "success" },
    PENDING: { label: "Pending", variant: "warning" },
    UNPAID: { label: "Unpaid", variant: "warning" },
    REFUNDED: { label: "Refunded", variant: "default" },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function StockStatusBadge({ status }: { status: StockStatus }) {
  const map: Record<StockStatus, { label: string; variant: "success" | "warning" | "destructive" | "default" }> = {
    IN_STOCK: { label: "In stock", variant: "success" },
    LOW_STOCK: { label: "Low stock", variant: "warning" },
    OUT_OF_STOCK: { label: "Out of stock", variant: "destructive" },
    DISCONTINUED: { label: "Discontinued", variant: "default" },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function RiderStatusBadge({ status }: { status: RiderStatus }) {
  const map: Record<RiderStatus, { label: string; variant: "success" | "info" | "default" }> = {
    AVAILABLE: { label: "Available", variant: "success" },
    ON_DELIVERY: { label: "On delivery", variant: "info" },
    OFFLINE: { label: "Offline", variant: "default" },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function DeliveryStatusBadge({ status }: { status: Delivery["status"] }) {
  const map: Record<Delivery["status"], { label: string; variant: "success" | "info" | "warning" | "destructive" | "default" }> = {
    UNASSIGNED: { label: "Unassigned", variant: "destructive" },
    ASSIGNED: { label: "Assigned", variant: "warning" },
    ACCEPTED: { label: "Accepted", variant: "info" },
    GO_TO_STORE: { label: "Going to store", variant: "info" },
    PICKED_UP: { label: "Picked up", variant: "info" },
    OUT_FOR_DELIVERY: { label: "Out for delivery", variant: "info" },
    DELIVERED: { label: "Delivered", variant: "success" },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}
