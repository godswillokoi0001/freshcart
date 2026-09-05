import * as React from "react"
import {
  CheckCircle2,
  Clock,
  PackageCheck,
  Truck,
  Home,
  RefreshCw,
  Radio,
  AlertCircle,
  Sparkles,
  MapPin,
  Calendar,
} from "lucide-react"
import { supabase, isSupabaseConfigured } from "@lib/supabase"
import { orderApi } from "@services/api"
import { Button } from "@components/ui/Button"
import { cn } from "@lib/utils"
import type { OrderStatus } from "@app-types/index"

export type DeliveryStageKey = "placed" | "processing" | "shipped" | "out_for_delivery" | "delivered"

interface DeliveryStage {
  key: DeliveryStageKey
  label: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  statusMatches: OrderStatus[]
}

const DELIVERY_STAGES: DeliveryStage[] = [
  {
    key: "placed",
    label: "Order Placed",
    title: "Order Placed & Confirmed",
    description: "Your grocery items have been registered in our database and queued for fulfillment.",
    icon: CheckCircle2,
    statusMatches: ["PENDING", "CONFIRMED"],
  },
  {
    key: "processing",
    label: "Processing",
    title: "Sorting & Packing Groceries",
    description: "Our fulfillment specialists are carefully selecting fresh produce and pantry goods.",
    icon: PackageCheck,
    statusMatches: ["PREPARING"],
  },
  {
    key: "shipped",
    label: "Shipped",
    title: "Packed & Ready for Dispatch",
    description: "Packed in temperature-controlled insulated totes and transferred to the local delivery hub.",
    icon: Clock,
    statusMatches: ["PACKED", "READY_FOR_PICKUP"],
  },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
    title: "Out for Delivery",
    description: "Your assigned dispatch rider is en route to your specified address.",
    icon: Truck,
    statusMatches: ["OUT_FOR_DELIVERY"],
  },
  {
    key: "delivered",
    label: "Delivered",
    title: "Successfully Delivered",
    description: "Package handed over and order fulfilled. Enjoy your fresh groceries!",
    icon: Home,
    statusMatches: ["DELIVERED"],
  },
]

function getStageIndex(status: string): number {
  switch (status) {
    case "PENDING":
      return 0
    case "CONFIRMED":
      return 0
    case "PREPARING":
      return 1
    case "PACKED":
    case "READY_FOR_PICKUP":
      return 2
    case "OUT_FOR_DELIVERY":
      return 3
    case "DELIVERED":
      return 4
    case "CANCELLED":
      return -1
    default:
      return 0
  }
}

interface RealtimeOrderTrackerProps {
  orderId: string
  orderNumber: string
  initialStatus: OrderStatus
  initialRiderName?: string
  deliverySlot?: string
  deliveryAddress?: string
  createdAt?: string
  onStatusChange?: (newStatus: OrderStatus) => void
  className?: string
}

export function RealtimeOrderTracker({
  orderId,
  orderNumber,
  initialStatus,
  initialRiderName,
  deliverySlot,
  deliveryAddress,
  createdAt,
  onStatusChange,
  className,
}: RealtimeOrderTrackerProps) {
  const [currentStatus, setCurrentStatus] = React.useState<OrderStatus>(initialStatus)
  const [riderName, setRiderName] = React.useState<string | undefined>(initialRiderName)
  const [isLiveConnected, setIsLiveConnected] = React.useState<boolean>(false)
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false)
  const [lastSyncTime, setLastSyncTime] = React.useState<string>(() => new Date().toLocaleTimeString())
  const [hasRecentPulse, setHasRecentPulse] = React.useState<boolean>(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Keep local state in sync when parent prop changes
  React.useEffect(() => {
    setCurrentStatus(initialStatus)
  }, [initialStatus])

  React.useEffect(() => {
    setRiderName(initialRiderName)
  }, [initialRiderName])

  // Fetch status directly from Supabase orders table
  const fetchFromSupabase = React.useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true)
    setErrorMessage(null)

    try {
      if (isSupabaseConfigured) {
        // Query Supabase orders table directly
        const { data, error } = await supabase
          .from("orders")
          .select("id, order_number, status, rider_name, updated_at")
          .or(`id.eq.${orderId},order_number.eq.${orderNumber}`)
          .maybeSingle()

        if (!error && data) {
          if (data.status) {
            const nextStatus = data.status as OrderStatus
            setCurrentStatus(nextStatus)
            if (data.rider_name) setRiderName(data.rider_name)
            setLastSyncTime(new Date().toLocaleTimeString())
            onStatusChange?.(nextStatus)
            triggerPulse()
            return
          }
        }
      }

      // Fallback: Query Express backend API /api/orders/:idOrNumber
      const apiOrder = await orderApi.get(orderNumber || orderId)
      if (apiOrder && apiOrder.status) {
        const nextStatus = apiOrder.status as OrderStatus
        setCurrentStatus(nextStatus)
        if (apiOrder.riderName) setRiderName(apiOrder.riderName)
        setLastSyncTime(new Date().toLocaleTimeString())
        onStatusChange?.(nextStatus)
        triggerPulse()
      }
    } catch (err: any) {
      console.warn("Realtime order fetch note:", err.message)
    } finally {
      if (showIndicator) {
        setTimeout(() => setIsRefreshing(false), 400)
      }
    }
  }, [orderId, orderNumber, onStatusChange])

  function triggerPulse() {
    setHasRecentPulse(true)
    setTimeout(() => setHasRecentPulse(false), 2500)
  }

  // Set up Supabase Realtime subscription on public:orders
  React.useEffect(() => {
    let channel: any = null
    let pollInterval: any = null

    // 1. Initial fetch from database
    fetchFromSupabase(false)

    // 2. Realtime WebSocket subscription via Supabase
    if (isSupabaseConfigured) {
      const channelName = `order-status-${orderNumber || orderId}-${Date.now()}`
      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
          },
          (payload: any) => {
            const row = payload.new
            if (row && (row.id === orderId || row.order_number === orderNumber)) {
              if (row.status) {
                const nextStatus = row.status as OrderStatus
                setCurrentStatus(nextStatus)
                if (row.rider_name) setRiderName(row.rider_name)
                setLastSyncTime(new Date().toLocaleTimeString())
                onStatusChange?.(nextStatus)
                triggerPulse()
              }
            }
          }
        )
        .subscribe((status: string) => {
          setIsLiveConnected(status === "SUBSCRIBED")
        })
    }

    // 3. Fallback polling every 8 seconds for robust live tracking
    pollInterval = setInterval(() => {
      fetchFromSupabase(false)
    }, 8000)

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [orderId, orderNumber, fetchFromSupabase, onStatusChange])

  const stageIndex = getStageIndex(currentStatus)
  const isCancelled = currentStatus === "CANCELLED"
  const currentStageObj = stageIndex >= 0 ? DELIVERY_STAGES[stageIndex] : null

  // Progress percentage calculation (0% to 100%)
  const progressPercent = isCancelled ? 0 : Math.min(100, Math.max(0, (stageIndex / (DELIVERY_STAGES.length - 1)) * 100))

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all",
        hasRecentPulse && "ring-2 ring-emerald-500/40",
        className
      )}
    >
      {/* Top Real-time Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-3 w-3">
              {isLiveConnected && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={cn(
                  "relative inline-flex h-3 w-3 rounded-full",
                  isLiveConnected ? "bg-emerald-400" : "bg-amber-400"
                )}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Radio className="h-3 w-3 animate-pulse" />
                  {isLiveConnected ? "Live Supabase Tracking" : "Live Order Status"}
                </span>
                {hasRecentPulse && (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    Just updated
                  </span>
                )}
              </div>
              <p className="text-sm font-extrabold text-white">
                {isCancelled ? "Order Cancelled" : currentStageObj?.title || "Order Tracking"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 hidden sm:inline">
              Updated {lastSyncTime}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchFromSupabase(true)}
              disabled={isRefreshing}
              className="h-8 border-slate-700 bg-slate-800/80 text-xs text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isRefreshing && "animate-spin text-emerald-400")} />
              {isRefreshing ? "Syncing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Current Stage Description Banner */}
        {!isCancelled && currentStageObj && (
          <div className="mt-4 rounded-xl bg-white/10 p-3 text-xs text-slate-200 backdrop-blur-xs flex items-start gap-2.5 border border-white/10">
            <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-white font-semibold">{currentStageObj.label}: </strong>
              {currentStageObj.description}
            </p>
          </div>
        )}

        {isCancelled && (
          <div className="mt-4 rounded-xl bg-rose-500/20 p-3 text-xs text-rose-200 border border-rose-500/30 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              This order has been cancelled. Any processed payment will be refunded according to your payment provider guidelines.
            </p>
          </div>
        )}
      </div>

      {/* Main Stepper Progress Bar */}
      <div className="p-6">
        {!isCancelled ? (
          <div>
            {/* Desktop & Tablet Stepper (Horizontal) */}
            <div className="hidden md:block">
              <div className="relative mb-8 mt-2">
                {/* Background Track */}
                <div className="absolute top-5 left-8 right-8 h-1 bg-slate-100 rounded-full" />
                {/* Active Filled Track */}
                <div
                  className="absolute top-5 left-8 h-1 bg-emerald-600 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `calc(${progressPercent}% * 0.85)` }}
                />

                <div className="relative z-10 flex justify-between">
                  {DELIVERY_STAGES.map((stage, idx) => {
                    const isCompleted = idx < stageIndex
                    const isCurrent = idx === stageIndex
                    const StageIcon = stage.icon

                    return (
                      <div key={stage.key} className="flex flex-col items-center text-center max-w-[120px]">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
                            isCompleted
                              ? "bg-emerald-600 text-white shadow-xs"
                              : isCurrent
                              ? "bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md scale-110"
                              : "bg-white border-2 border-slate-200 text-slate-400"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <StageIcon className="h-5 w-5" />
                          )}
                        </div>

                        <span
                          className={cn(
                            "mt-2 text-xs font-bold transition-colors",
                            isCurrent
                              ? "text-emerald-700"
                              : isCompleted
                              ? "text-slate-900"
                              : "text-slate-400"
                          )}
                        >
                          {stage.label}
                        </span>

                        <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          {isCurrent ? (
                            <span className="inline-flex items-center text-emerald-600 font-semibold">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600 mr-1 animate-ping" />
                              Active
                            </span>
                          ) : isCompleted ? (
                            "Done"
                          ) : (
                            "Pending"
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Mobile Stepper (Vertical Timeline with detailed descriptions) */}
            <div className="block md:hidden space-y-4">
              {DELIVERY_STAGES.map((stage, idx) => {
                const isCompleted = idx < stageIndex
                const isCurrent = idx === stageIndex
                const isUpcoming = idx > stageIndex
                const StageIcon = stage.icon
                const isLast = idx === DELIVERY_STAGES.length - 1

                return (
                  <div key={stage.key} className="relative flex gap-3.5 items-start">
                    {/* Vertical Connector line */}
                    {!isLast && (
                      <div
                        className={cn(
                          "absolute left-4 top-8 -bottom-4 w-0.5",
                          idx < stageIndex ? "bg-emerald-600" : "bg-slate-200"
                        )}
                      />
                    )}

                    <div
                      className={cn(
                        "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all",
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : isCurrent
                          ? "bg-emerald-600 text-white ring-4 ring-emerald-100 scale-105"
                          : "bg-white border-2 border-slate-200 text-slate-400"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <StageIcon className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex-1 pb-3">
                      <div className="flex items-center justify-between">
                        <p
                          className={cn(
                            "text-sm font-bold",
                            isCurrent
                              ? "text-emerald-700"
                              : isCompleted
                              ? "text-slate-900"
                              : "text-slate-400"
                          )}
                        >
                          {stage.label}
                        </p>
                        {isCurrent && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            Current Stage
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                        {stage.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
            <h3 className="mt-2 text-base font-bold text-slate-900">Order Cancellation</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              This order has been officially cancelled and removed from active fulfillment queues.
            </p>
          </div>
        )}

        {/* Live Rider & Logistics Details Card */}
        {riderName && currentStatus !== "CANCELLED" && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900">{riderName}</p>
                  <span className="rounded-full bg-emerald-200/70 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {currentStatus === "OUT_FOR_DELIVERY" ? "En Route Now" : "Assigned Rider"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  FreshCart Express Logistics · Dedicated Supermarket Courier
                </p>
              </div>
            </div>

            {deliverySlot && (
              <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-100">
                <p className="text-xs font-semibold text-slate-500">Estimated Delivery Window</p>
                <p className="text-xs font-bold text-emerald-900">{deliverySlot}</p>
              </div>
            )}
          </div>
        )}

        {/* Additional Delivery Meta (Slot + Address summary) */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
          {deliverySlot && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                <strong className="text-slate-800">Slot:</strong> {deliverySlot}
              </span>
            </div>
          )}
          {deliveryAddress && (
            <div className="flex items-center gap-2 truncate">
              <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="truncate">
                <strong className="text-slate-800">Destination:</strong> {deliveryAddress}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
