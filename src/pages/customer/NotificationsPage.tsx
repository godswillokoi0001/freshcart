import { Link } from "react-router-dom"
import { ChevronRight, Bell, AlertCircle, Package, Truck, User, CheckCircle2 } from "lucide-react"
import { Button } from "@components/ui/Button"
import { EmptyState } from "@components/ui/EmptyState"
import { Avatar, AvatarFallback } from "@components/ui/Avatar"
import { notifications } from "@data/orders"
import { useAuth } from "@context/AuthContext"
import { formatDateTime } from "@lib/format"
import { cn } from "@lib/utils"

const iconMap: Record<string, React.ReactNode> = {
  ORDER: <Package className="h-5 w-5" />,
  DELIVERY: <Truck className="h-5 w-5" />,
  PROMO: <AlertCircle className="h-5 w-5" />,
  ACCOUNT: <User className="h-5 w-5" />,
}

export function NotificationsPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="container py-8">
        <h1 className="mb-2 text-2xl font-bold text-navy-900">Notifications</h1>
        <EmptyState
          icon={Bell}
          title="Please sign in to view notifications"
          description="Sign in to see order updates, delivery alerts and promotions."
          action={{ label: "Sign In", href: "/sign-in" }}
        />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Notifications</h1>
        {notifications.some((n) => !n.read) && (
          <Button variant="outline" size="sm" onClick={() => alert("Mark all as read (demo)")}>
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="We'll notify you about order updates, deliveries and special offers."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Link
              key={n.id}
              to={n.type === "ORDER" || n.type === "DELIVERY" ? "/orders" : "/account"}
              className={cn(
                "flex items-start gap-3 rounded-lg p-4 transition-colors",
                n.read ? "bg-white" : "bg-fresh-50 ring-1 ring-fresh-500"
              )}
            >
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", n.read ? "bg-navy-100 text-navy-500" : "bg-fresh-100 text-fresh-700")}>
                {iconMap[n.type]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className={cn("font-medium", n.read ? "text-navy-900" : "text-navy-900")}>{n.title}</p>
                  <time className="text-xs text-navy-400 whitespace-nowrap">{formatDateTime(n.createdAt)}</time>
                </div>
                <p className="mt-1 text-sm text-navy-600">{n.message}</p>
              </div>
              {!n.read && (
                <span className="flex h-2 w-2 shrink-0 mt-2 rounded-full bg-fresh-600" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
