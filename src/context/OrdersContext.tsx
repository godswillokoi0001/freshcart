import * as React from "react"
import type { Order, OrderStatus, Address, OrderItem, OrderTimelineEvent, PaymentStatus } from "@app-types/index"
import { orders as customerOrders, addresses as initialAddresses } from "@data/orders"
import { adminOrders } from "@data/admin-orders"
import { useToast } from "./ToastContext"
import { useAuth } from "./AuthContext"
import { orderApi, addressApi } from "../services/api"

const combinedInitialOrders: Order[] = [
  ...customerOrders,
  ...adminOrders.filter((ao) => !customerOrders.some((co) => co.orderNumber === ao.orderNumber)),
]

interface OrdersContextValue {
  orders: Order[]
  addresses: Address[]
  loading: boolean
  createOrder: (data: {
    customerId: string
    customerName: string
    customerEmail?: string
    customerPhone: string
    items: OrderItem[]
    subtotal: number
    deliveryFee: number
    discount: number
    total: number
    paymentMethod: "Card" | "Bank Transfer" | "Pay on Delivery"
    paymentStatus?: PaymentStatus
    address: Address
    deliverySlot: string
    deliveryNotes?: string
    couponCode?: string
  }) => Promise<Order>
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>
  assignRider: (orderId: string, riderId: string, riderName: string) => Promise<void>
  updateOrderItemStatus: (
    orderId: string,
    productId: string,
    pickedStatus: "PICKED" | "OUT_OF_STOCK" | "SUBSTITUTED",
    substitutionNote?: string
  ) => void
  cancelOrder: (orderId: string, reason?: string) => Promise<void>
  getOrder: (idOrNumber: string) => Order | undefined
  fetchOrderById: (idOrNumber: string) => Promise<Order | null>
  addAddress: (address: Omit<Address, "id">) => Promise<Address>
  setDefaultAddress: (addressId: string) => Promise<void>
  deleteAddress: (addressId: string) => Promise<void>
  refreshOrders: () => Promise<void>
}

const OrdersContext = React.createContext<OrdersContextValue | null>(null)

const ORDERS_STORAGE_KEY = "freshcart-orders"
const ADDRESSES_STORAGE_KEY = "freshcart-addresses"

function buildTimeline(status: OrderStatus, placedAt: string): OrderTimelineEvent[] {
  const t = (hours: number) => new Date(new Date(placedAt).getTime() + hours * 3600 * 1000).toISOString()
  const base = [
    { label: "Order placed", timestamp: placedAt },
    { label: "Payment confirmed", timestamp: t(0.05) },
    { label: "Order confirmed", timestamp: t(0.2) },
    { label: "Being prepared", timestamp: t(0.8) },
    { label: "Packed", timestamp: t(1.5) },
    { label: "Rider assigned", timestamp: t(2.0) },
    { label: "Out for delivery", timestamp: t(2.5) },
    { label: "Delivered", timestamp: t(3.5) },
  ]

  const statusIdx: Record<OrderStatus, number> = {
    PENDING: 0,
    CONFIRMED: 2,
    PREPARING: 3,
    PACKED: 4,
    READY_FOR_PICKUP: 4,
    OUT_FOR_DELIVERY: 6,
    DELIVERED: 7,
    CANCELLED: 1,
  }

  const upto = statusIdx[status] ?? 0
  return base.map((e, i) => ({
    label: e.label,
    timestamp: e.timestamp,
    completed: status === "CANCELLED" ? i === 0 : i <= upto,
    current: i === upto,
  }))
}

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY)
    if (!raw) return combinedInitialOrders
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : combinedInitialOrders
  } catch {
    return combinedInitialOrders
  }
}

function loadAddresses(): Address[] {
  try {
    const raw = localStorage.getItem(ADDRESSES_STORAGE_KEY)
    if (!raw) return initialAddresses
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialAddresses
  } catch {
    return initialAddresses
  }
}

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = React.useState<Order[]>(loadOrders)
  const [addresses, setAddresses] = React.useState<Address[]>(loadAddresses)
  const [loading, setLoading] = React.useState(false)
  const { success, error } = useToast()
  const { isSignedIn, token } = useAuth()

  // Fetch real data from backend when signed in
  const refreshOrders = React.useCallback(async () => {
    try {
      setLoading(true)
      const backendOrders = await orderApi.list()
      if (Array.isArray(backendOrders) && backendOrders.length > 0) {
        setOrders(backendOrders)
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(backendOrders))
      }
    } catch (e) {
      console.warn("Could not fetch backend orders, using cached:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshAddresses = React.useCallback(async () => {
    try {
      const backendAddrs = await addressApi.list()
      if (Array.isArray(backendAddrs) && backendAddrs.length > 0) {
        setAddresses(backendAddrs)
        localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(backendAddrs))
      }
    } catch (e) {
      console.warn("Could not fetch backend addresses:", e)
    }
  }, [])

  React.useEffect(() => {
    if (isSignedIn && token) {
      refreshOrders()
      refreshAddresses()
    }
  }, [isSignedIn, token, refreshOrders, refreshAddresses])

  React.useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
    } catch (e) {
      console.error("Failed to persist orders:", e)
    }
  }, [orders])

  React.useEffect(() => {
    try {
      localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses))
    } catch (e) {
      console.error("Failed to persist addresses:", e)
    }
  }, [addresses])

  const createOrder = React.useCallback(
    async (data: {
      customerId: string
      customerName: string
      customerEmail?: string
      customerPhone: string
      items: OrderItem[]
      subtotal: number
      deliveryFee: number
      discount: number
      total: number
      paymentMethod: "Card" | "Bank Transfer" | "Pay on Delivery"
      paymentStatus?: PaymentStatus
      address: Address
      deliverySlot: string
      deliveryNotes?: string
      couponCode?: string
    }): Promise<Order> => {
      try {
        const checkoutPayload = {
          items: data.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          deliveryAddress: data.address,
          deliverySlot: data.deliverySlot,
          deliveryNotes: data.deliveryNotes,
          paymentMethod: data.paymentMethod,
          couponCode: data.couponCode,
          customerEmail: data.customerEmail,
          guestEmail: data.customerEmail,
        }

        const res = await orderApi.checkout(checkoutPayload)
        const now = new Date().toISOString()

        const newOrder: Order = {
          id: res.orderId,
          orderNumber: res.orderNumber,
          customerId: data.customerId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          items: data.items,
          subtotal: res.subtotal,
          deliveryFee: res.deliveryFee,
          discount: res.discount,
          total: res.total,
          paymentMethod: data.paymentMethod,
          paymentStatus: (res.paymentStatus as PaymentStatus) || (data.paymentMethod === "Pay on Delivery" ? "PENDING" : "PAID"),
          status: (res.status as OrderStatus) || "CONFIRMED",
          address: data.address,
          deliverySlot: data.deliverySlot,
          deliveryNotes: data.deliveryNotes,
          createdAt: now,
          timeline: buildTimeline((res.status as OrderStatus) || "CONFIRMED", now),
          couponCode: data.couponCode,
        }

        setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)])
        success("Order Placed Successfully", `Order ${res.orderNumber} is confirmed!`)
        return newOrder
      } catch (err: any) {
        console.warn("Backend checkout error, using optimistic order:", err)
        // Fallback local creation
        const randomNum = Math.floor(10000 + Math.random() * 90000)
        const orderNumber = `FC-${randomNum}`
        const orderId = `ord-${Date.now()}`
        const now = new Date().toISOString()

        const fallbackOrder: Order = {
          id: orderId,
          orderNumber,
          customerId: data.customerId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          items: data.items,
          subtotal: data.subtotal,
          deliveryFee: data.deliveryFee,
          discount: data.discount,
          total: data.total,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus ?? (data.paymentMethod === "Pay on Delivery" ? "PENDING" : "PAID"),
          status: "CONFIRMED",
          address: data.address,
          deliverySlot: data.deliverySlot,
          deliveryNotes: data.deliveryNotes,
          createdAt: now,
          timeline: buildTimeline("CONFIRMED", now),
          couponCode: data.couponCode,
        }

        setOrders((prev) => [fallbackOrder, ...prev])
        success("Order Placed Successfully", `Order ${orderNumber} is confirmed!`)
        return fallbackOrder
      }
    },
    [success]
  )

  const updateOrderStatus = React.useCallback(
    async (orderId: string, status: OrderStatus, note?: string) => {
      try {
        await orderApi.updateStatus(orderId, { status, note })
      } catch (e) {
        console.warn("Backend status update:", e)
      }

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId && o.orderNumber !== orderId) return o
          return {
            ...o,
            status,
            paymentStatus: status === "DELIVERED" && o.paymentMethod === "Pay on Delivery" ? "PAID" : o.paymentStatus,
            timeline: buildTimeline(status, o.createdAt),
          }
        })
      )
      success("Status Updated", `Order updated to ${status.replace(/_/g, " ")}`)
    },
    [success]
  )

  const assignRider = React.useCallback(
    async (orderId: string, riderId: string, riderName: string) => {
      try {
        await orderApi.updateStatus(orderId, { status: "OUT_FOR_DELIVERY", riderId, riderName })
      } catch (e) {
        console.warn("Backend assign rider error:", e)
      }

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId && o.orderNumber !== orderId) return o
          return {
            ...o,
            riderId,
            riderName,
            status: "OUT_FOR_DELIVERY",
            timeline: buildTimeline("OUT_FOR_DELIVERY", o.createdAt),
          }
        })
      )
      success("Rider Assigned", `${riderName} assigned to deliver.`)
    },
    [success]
  )

  const updateOrderItemStatus = React.useCallback(
    (
      orderId: string,
      productId: string,
      pickedStatus: "PICKED" | "OUT_OF_STOCK" | "SUBSTITUTED",
      substitutionNote?: string
    ) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId && o.orderNumber !== orderId) return o
          const updatedItems = o.items.map((it) =>
            it.productId === productId
              ? { ...it, pickedStatus, substitutionNote: substitutionNote ?? it.substitutionNote }
              : it
          )
          return { ...o, items: updatedItems }
        })
      )
    },
    []
  )

  const cancelOrder = React.useCallback(
    async (orderId: string, reason?: string) => {
      try {
        await orderApi.cancel(orderId, reason)
      } catch (e: any) {
        console.warn("Backend cancel error:", e)
      }

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId && o.orderNumber !== orderId) return o
          return {
            ...o,
            status: "CANCELLED",
            timeline: buildTimeline("CANCELLED", o.createdAt),
          }
        })
      )
      success("Order Cancelled", reason ?? "Your order has been cancelled.")
    },
    [success]
  )

  const getOrder = React.useCallback(
    (idOrNumber: string) => {
      return orders.find((o) => o.id === idOrNumber || o.orderNumber.toUpperCase() === idOrNumber.toUpperCase())
    },
    [orders]
  )

  const fetchOrderById = React.useCallback(async (idOrNumber: string): Promise<Order | null> => {
    try {
      const ord = await orderApi.get(idOrNumber)
      if (ord) {
        setOrders((prev) => [ord, ...prev.filter((o) => o.id !== ord.id && o.orderNumber !== ord.orderNumber)])
        return ord
      }
    } catch (e) {
      console.warn("Backend fetchOrderById:", e)
    }
    return null
  }, [])

  const addAddress = React.useCallback(
    async (addrData: Omit<Address, "id">): Promise<Address> => {
      try {
        const res = await addressApi.create(addrData)
        setAddresses((prev) => {
          if (res.isDefault) {
            return [res, ...prev.map((a) => ({ ...a, isDefault: false }))]
          }
          return [...prev, res]
        })
        success("Address Saved", `${res.label} address has been added.`)
        return res
      } catch (err: any) {
        console.warn("Backend add address error, fallback:", err)
        const newAddr: Address = {
          ...addrData,
          id: `addr-${Date.now()}`,
        }
        setAddresses((prev) => {
          if (newAddr.isDefault) {
            return [newAddr, ...prev.map((a) => ({ ...a, isDefault: false }))]
          }
          return [...prev, newAddr]
        })
        success("Address Saved", `${newAddr.label} address has been added.`)
        return newAddr
      }
    },
    [success]
  )

  const setDefaultAddress = React.useCallback(
    async (addressId: string) => {
      try {
        await addressApi.setDefault(addressId)
      } catch (e) {
        console.warn(e)
      }
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === addressId,
        }))
      )
    },
    []
  )

  const deleteAddress = React.useCallback(
    async (addressId: string) => {
      try {
        await addressApi.delete(addressId)
      } catch (e) {
        console.warn(e)
      }
      setAddresses((prev) => prev.filter((a) => a.id !== addressId))
      success("Address Removed", "The delivery address was deleted.")
    },
    [success]
  )

  return (
    <OrdersContext.Provider
      value={{
        orders,
        addresses,
        loading,
        createOrder,
        updateOrderStatus,
        assignRider,
        updateOrderItemStatus,
        cancelOrder,
        getOrder,
        fetchOrderById,
        addAddress,
        setDefaultAddress,
        deleteAddress,
        refreshOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const ctx = React.useContext(OrdersContext)
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider")
  return ctx
}
