import { Link, useNavigate } from "react-router-dom"
import { ChevronRight, Package, Truck, RotateCcw, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@components/ui/Button"
import { EmptyState } from "@components/ui/EmptyState"
import { OrderStatusBadge } from "@components/shared/StatusBadges"
import { orders, ordersForCustomer } from "@data/orders"
import { useAuth } from "@context/AuthContext"
import { formatNaira, formatDate } from "@lib/format"
import { cn } from "@lib/utils"

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4" />,
  CONFIRMED: <CheckCircle2 className="h-4 w-4" />,
  PREPARING: <RotateCcw className="h-4 w-4" />,
  PACKED: <Package className="h-4 w-4" />,
  READY_FOR_PICKUP: <Truck className="h-4 w-4" />,
  OUT_FOR_DELIVERY: <Truck className="h-4 w-4" />,
  DELIVERED: <CheckCircle2 className="h-4 w-4" />,
  CANCELLED: <AlertCircle className="h-4 w-4" />,
}

export function OrdersPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="container py-8">
        <h1 className="mb-2 text-2xl font-bold text-navy-900">Your Orders</h1>
        <EmptyState
          icon={Package}
          title="Please sign in to view your orders"
          description="Sign in to see your order history and track deliveries."
          action={{ label: "Sign In", href: "/sign-in" }}
          secondaryAction={{ label: "Create Account", href: "/sign-up" }}
        />
      </div>
    )
  }

  const myOrders = ordersForCustomer(user.id)

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Your Orders</h1>
        <Button asChild variant="outline">
          <Link to="/shop">Continue Shopping</Link>
        </Button>
      </div>

      {myOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="You haven't placed any orders yet."
          description="When you do, they'll appear here with real-time tracking."
          action={{ label: "Start shopping", href: "/shop" }}
        />
      ) : (
        <div className="space-y-4">
          {myOrders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="flex flex-col gap-3 rounded-lg border border-navy-200 bg-white p-4 shadow-sm hover:border-navy-300 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy-50">
                  <Package className="h-6 w-6 text-navy-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-navy-900">{order.orderNumber}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="mt-0.5 text-sm text-navy-500">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center">
                <p className="text-base font-bold text-navy-900">{formatNaira(order.total)}</p>
                <ChevronRight className="h-5 w-5 text-navy-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
