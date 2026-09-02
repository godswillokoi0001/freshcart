import type { Order, Address, Customer, Notification } from "@app-types/index"
import { products } from "./products"

function item(productId: string, qty: number) {
  const p = products.find((x) => x.id === productId)!
  return {
    productId: p.id,
    name: p.name,
    brand: p.brand,
    unit: p.unit,
    imageUrl: p.imageUrl,
    price: p.price,
    quantity: qty,
  }
}

export const defaultAddress: Address = {
  id: "addr-1",
  label: "Home",
  fullName: "Amaka Obi",
  phone: "+234 803 555 1234",
  line1: "14B Adeola Odeku Street",
  line2: "Apartment 7C",
  city: "Victoria Island",
  state: "Lagos",
  isDefault: true,
}

export const workAddress: Address = {
  id: "addr-2",
  label: "Office",
  fullName: "Amaka Obi",
  phone: "+234 803 555 1234",
  line1: "Plot 7 Ahmadu Bello Way",
  line2: "3rd Floor, Blue Pearl Building",
  city: "Victoria Island",
  state: "Lagos",
  isDefault: false,
}

export const addresses: Address[] = [defaultAddress, workAddress]

export const currentCustomer: Customer = {
  id: "cust-1",
  name: "Amaka Obi",
  email: "amaka.obi@example.com",
  phone: "+234 803 555 1234",
  status: "ACTIVE",
  joinedAt: "2025-03-12T09:00:00Z",
  ordersCount: 24,
  totalSpent: 687450,
  lastOrderAt: "2026-08-30T11:24:00Z",
  addresses,
}

function timeline(status: string, placedAt: string): Order["timeline"] {
  const t = (hours: number) => new Date(new Date(placedAt).getTime() + hours * 3600 * 1000).toISOString()
  const base = [
    { label: "Order placed", timestamp: placedAt },
    { label: "Payment confirmed", timestamp: t(0.1) },
    { label: "Order confirmed", timestamp: t(0.5) },
    { label: "Being prepared", timestamp: t(2) },
    { label: "Packed", timestamp: t(4) },
    { label: "Rider assigned", timestamp: t(5) },
    { label: "Out for delivery", timestamp: t(6) },
    { label: "Delivered", timestamp: t(8) },
  ]
  const flow: Record<string, number> = {
    PENDING: 0, CONFIRMED: 2, PREPARING: 3, PACKED: 4,
    READY_FOR_PICKUP: 4, OUT_FOR_DELIVERY: 6, DELIVERED: 8, CANCELLED: 1,
  }
  const upto = flow[status] ?? 8
  return base.map((e, i) => ({
    label: e.label,
    timestamp: e.timestamp,
    completed: i <= upto && status !== "CANCELLED" ? true : i === 0,
    current: i === upto,
  }))
}

const day = 24 * 3600 * 1000
function ago(days: number): string {
  return new Date(Date.now() - days * day).toISOString()
}

export const orders: Order[] = [
  {
    id: "ord-10024",
    orderNumber: "FC-10234",
    customerId: "cust-1",
    customerName: "Amaka Obi",
    customerPhone: "+234 803 555 1234",
    items: [item("prod-15", 2), item("prod-26", 1), item("prod-17", 2), item("prod-38", 1), item("prod-43", 1)],
    subtotal: 8250,
    deliveryFee: 1500,
    discount: 500,
    total: 9250,
    paymentMethod: "Card",
    paymentStatus: "PAID",
    status: "OUT_FOR_DELIVERY",
    address: defaultAddress,
    deliverySlot: "Today, 2:00 PM – 4:00 PM",
    deliveryNotes: "Please call when you reach the gate.",
    riderId: "rider-1",
    riderName: "Michael Eze",
    createdAt: ago(0.2),
    timeline: timeline("OUT_FOR_DELIVERY", ago(0.2)),
    couponCode: "FRESH500",
  },
  {
    id: "ord-10023",
    orderNumber: "FC-10228",
    customerId: "cust-1",
    customerName: "Amaka Obi",
    customerPhone: "+234 803 555 1234",
    items: [item("prod-1", 1), item("prod-22", 1), item("prod-30", 2), item("prod-38", 1)],
    subtotal: 107300,
    deliveryFee: 0,
    discount: 3000,
    total: 104300,
    paymentMethod: "Bank Transfer",
    paymentStatus: "PAID",
    status: "DELIVERED",
    address: defaultAddress,
    deliverySlot: "Aug 29, 9:00 AM – 11:00 AM",
    riderId: "rider-2",
    riderName: "David Okafor",
    createdAt: ago(3),
    timeline: timeline("DELIVERED", ago(3)),
    couponCode: "BULK3000",
  },
  {
    id: "ord-10022",
    orderNumber: "FC-10190",
    customerId: "cust-1",
    customerName: "Amaka Obi",
    customerPhone: "+234 803 555 1234",
    items: [item("prod-9", 1), item("prod-16", 1), item("prod-2", 1), item("prod-55", 2)],
    subtotal: 22100,
    deliveryFee: 1500,
    discount: 0,
    total: 23600,
    paymentMethod: "Card",
    paymentStatus: "PAID",
    status: "DELIVERED",
    address: workAddress,
    deliverySlot: "Aug 24, 12:00 PM – 2:00 PM",
    riderId: "rider-3",
    riderName: "Emmanuel Bello",
    createdAt: ago(8),
    timeline: timeline("DELIVERED", ago(8)),
  },
  {
    id: "ord-10021",
    orderNumber: "FC-10155",
    customerId: "cust-1",
    customerName: "Amaka Obi",
    customerPhone: "+234 803 555 1234",
    items: [item("prod-19", 1), item("prod-38", 1), item("prod-51", 1)],
    subtotal: 9700,
    deliveryFee: 1500,
    discount: 0,
    total: 11200,
    paymentMethod: "Pay on Delivery",
    paymentStatus: "PAID",
    status: "CANCELLED",
    address: defaultAddress,
    deliverySlot: "Aug 20, 4:00 PM – 6:00 PM",
    createdAt: ago(12),
    timeline: timeline("CANCELLED", ago(12)),
  },
  {
    id: "ord-10020",
    orderNumber: "FC-10120",
    customerId: "cust-1",
    customerName: "Amaka Obi",
    customerPhone: "+234 803 555 1234",
    items: [item("prod-13", 1), item("prod-14", 1), item("prod-29", 1)],
    subtotal: 15500,
    deliveryFee: 1500,
    discount: 0,
    total: 17000,
    paymentMethod: "Card",
    paymentStatus: "PAID",
    status: "DELIVERED",
    address: defaultAddress,
    deliverySlot: "Aug 12, 10:00 AM – 12:00 PM",
    riderId: "rider-1",
    riderName: "Michael Eze",
    createdAt: ago(20),
    timeline: timeline("DELIVERED", ago(20)),
  },
]

export const ordersForCustomer = (customerId: string) => orders.filter((o) => o.customerId === customerId)
export const orderById = (id: string) => orders.find((o) => o.id === id)

export const notifications: Notification[] = [
  { id: "n1", title: "Your order is out for delivery", message: "ORDER #FC-10234 is on the way. Michael will arrive between 2:00 PM and 4:00 PM.", type: "DELIVERY", read: false, createdAt: ago(0.1) },
  { id: "n2", title: "Payment confirmed", message: "We received your payment of ₦9,250 for ORDER #FC-10234.", type: "ORDER", read: false, createdAt: ago(0.2) },
  { id: "n3", title: "Weekend deals are live", message: "Save up to 20% on rice, oil and pantry staples. Ends Sunday.", type: "PROMO", read: false, createdAt: ago(2) },
  { id: "n4", title: "Order delivered", message: "ORDER #FC-10228 was delivered. We'd love your feedback on the items.", type: "DELIVERY", read: true, createdAt: ago(3) },
  { id: "n5", title: "Your delivery was rescheduled", message: "ORDER #FC-10190 moved to Aug 24, 12:00 PM – 2:00 PM at your request.", type: "DELIVERY", read: true, createdAt: ago(8) },
  { id: "n6", title: "New sign-in to your account", message: "Your FreshCart account was signed in on a new device (Chrome, Windows).", type: "ACCOUNT", read: true, createdAt: ago(10) },
]