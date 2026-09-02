import type { Order, OrderItem, OrderStatus, PaymentStatus } from "@app-types/index"

function makeItem(name: string, brand: string, unit: string, price: number, qty: number, productId: string): OrderItem {
  return { productId, name, brand, unit, imageUrl: "", price, quantity: qty }
}

type RawOrder = {
  id: string
  customer: string
  phone: string
  items: OrderItem[]
  status: OrderStatus
  payment: PaymentStatus
  method: "Card" | "Bank Transfer" | "Pay on Delivery"
  hoursAgo: number
  area: string
  rider?: string
}

const raw: RawOrder[] = [
  { id: "FC-10236", customer: "Tunde Bakare", phone: "+234 802 444 5555", status: "PENDING", payment: "PAID", method: "Card", hoursAgo: 0.3, area: "Ikeja", items: [makeItem("Golden Penny Spaghetti", "Golden Penny", "500g", 1250, 3, "prod-15"), makeItem("Indomie Belle Full 4-Pack", "Indomie", "120g × 4", 1700, 2, "prod-19"), makeItem("Power Oil", "Power Oil", "5L", 12500, 1, "prod-22"), makeItem("Fresh Eggs — Full Crate", "FreshCart Farms", "30 pcs", 6500, 1, "prod-38")] },
  { id: "FC-10237", customer: "Ngozi Eze", phone: "+234 808 123 4567", status: "PENDING", payment: "PAID", method: "Card", hoursAgo: 0.5, area: "Ikeja", items: [makeItem("Tomatoes", "FreshCart Farms", "1kg", 3500, 2, "prod-43"), makeItem("Red Onions", "FreshCart Farms", "1kg", 2800, 1, "prod-44"), makeItem("Pepper Mix (Rodo & Tatashe)", "FreshCart Farms", "500g", 2000, 2, "prod-45"), makeItem("Mackerel (Titus)", "FreshCart Fisheries", "1kg", 5800, 1, "prod-35")] },
  { id: "FC-10238", customer: "Emeka Obi", phone: "+234 803 987 6543", status: "CONFIRMED", payment: "PAID", method: "Bank Transfer", hoursAgo: 1.2, area: "Ogudu", items: [makeItem("Dangote Premium Parboiled Rice", "Dangote", "50kg bag", 89500, 1, "prod-1"), makeItem("Mamador Cooking Oil", "Mamador", "2.5L", 7900, 1, "prod-23"), makeItem("Ijebu Garri (Sour)", "FreshCart Farms", "5kg", 5500, 1, "prod-8")] },
  { id: "FC-10239", customer: "Grace Okonkwo", phone: "+234 807 888 1212", status: "PREPARING", payment: "PAID", method: "Card", hoursAgo: 2.1, area: "Ikeja", items: [makeItem("Pampers Baby-Dry", "Pampers", "Size 2 × 56", 12500, 1, "prod-59"), makeItem("Baby Wipes", "Pampers", "80 wipes", 2400, 2, "prod-61"), makeItem("Cerelac Maize & Wheat", "Cerelac", "400g", 5600, 1, "prod-60")] },
  { id: "FC-10240", customer: "Sola Adeleke", phone: "+234 809 222 3333", status: "PREPARING", payment: "UNPAID", method: "Pay on Delivery", hoursAgo: 2.8, area: "Ikoyi", items: [makeItem("Peak Milk Powder", "Peak", "900g refill pack", 9500, 2, "prod-26"), makeItem("Milo Activ-Go", "Milo", "1.8kg", 8900, 1, "prod-49"), makeItem("Nescafé Classic", "Nescafé", "200g jar", 4800, 1, "prod-51")] },
  { id: "FC-10231", customer: "Halima Yusuf", phone: "+234 806 555 7777", status: "PACKED", payment: "PAID", method: "Card", hoursAgo: 4, area: "Surulere", items: [makeItem("Dettol Antiseptic", "Dettol", "500ml", 4900, 1, "prod-66"), makeItem("Ariel Detergent", "Ariel", "1kg", 4200, 2, "prod-68"), makeItem("Harpic Toilet Cleaner", "Harpic", "500ml", 2600, 1, "prod-67"), makeItem("Toilet Roll", "Softouch", "12 rolls", 3800, 1, "prod-64")] },
  { id: "FC-10233", customer: "Blessing Ijeoma", phone: "+234 805 111 9999", status: "OUT_FOR_DELIVERY", payment: "PAID", method: "Card", hoursAgo: 3, area: "Ikoyi", rider: "David Okafor", items: [makeItem("FreshCart Sliced Bread", "FreshCart Bakery", "500g loaf", 1800, 2, "prod-29"), makeItem("Fresh Eggs — Half Crate", "FreshCart Farms", "15 pcs", 3400, 1, "prod-39"), makeItem("Strawberry Jam", "FreshCart Farms", "400g", 2600, 1, "prod-40")] },
  { id: "FC-10230", customer: "Kelechi Amadi", phone: "+234 806 343 5656", status: "DELIVERED", payment: "PAID", method: "Card", hoursAgo: 9, area: "Yaba", rider: "Emmanuel Bello", items: [makeItem("Mama's Pride Parboiled Rice", "Mama's Pride", "10kg bag", 18700, 1, "prod-2"), makeItem("Golden Penny Vegetable Oil", "Golden Penny", "1L", 3600, 1, "prod-24"), makeItem("Coca-Cola", "Coca-Cola", "50cl × 12", 5400, 1, "prod-50")] },
  { id: "FC-10229", customer: "Ada Nwankwo", phone: "+234 801 654 9870", status: "DELIVERED", payment: "PAID", method: "Card", hoursAgo: 10, area: "Ikoyi", rider: "Michael Eze", items: [makeItem("Beef (Cut)", "FreshCart Butchery", "1kg", 7800, 2, "prod-31"), makeItem("Chicken Thigh", "FreshCart Butchery", "1kg", 6400, 1, "prod-32"), makeItem("Tomatoes", "FreshCart Farms", "1kg", 3500, 1, "prod-43")] },
  { id: "FC-10228", customer: "Ibrahim Musa", phone: "+234 804 222 8888", status: "DELIVERED", payment: "PAID", method: "Bank Transfer", hoursAgo: 24, area: "Surulere", rider: "Femi Ogundipe", items: [makeItem("Nasco Corn Flakes Family Pack", "Nasco", "1.2kg", 7900, 1, "prod-57"), makeItem("Quaker Oats", "Quaker", "500g", 3900, 1, "prod-58"), makeItem("Peak Evaporated Milk", "Peak", "160g tin", 450, 4, "prod-27")] },
  { id: "FC-10227", customer: "Amaka Obi", phone: "+234 803 555 1234", status: "READY_FOR_PICKUP", payment: "PAID", method: "Card", hoursAgo: 3.5, area: "Victoria Island", items: [makeItem("Golden Penny Spaghetti", "Golden Penny", "500g", 1250, 4, "prod-15"), makeItem("Mamador Cooking Oil", "Mamador", "2.5L", 7900, 1, "prod-23")] },
  { id: "FC-10226", customer: "Bola Adeyemi", phone: "+234 802 777 3311", status: "DELIVERED", payment: "PAID", method: "Card", hoursAgo: 26, area: "Ikeja", rider: "David Okafor", items: [makeItem("Closeup Toothpaste", "Closeup", "130g", 1850, 2, "prod-71"), makeItem("Dettol Soap", "Dettol", "110g × 3", 1350, 1, "prod-72"), makeItem("Vaseline Petroleum Jelly", "Vaseline", "250ml", 2200, 1, "prod-73")] },
]

const day = 24 * 3600 * 1000

function timelineFor(status: OrderStatus, placedAt: string): Order["timeline"] {
  const t = (hours: number) => new Date(new Date(placedAt).getTime() + hours * 3600 * 1000).toISOString()
  const flow: Record<string, number> = {
    PENDING: 0, CONFIRMED: 2, PREPARING: 3, PACKED: 4,
    READY_FOR_PICKUP: 4, OUT_FOR_DELIVERY: 6, DELIVERED: 8, CANCELLED: 1,
  }
  const upto = flow[status] ?? 8
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
  return base.map((e, i) => ({
    label: e.label,
    timestamp: e.timestamp,
    completed: i <= upto,
    current: i === upto,
  }))
}

export const adminOrders: Order[] = raw.map((r, i) => {
  const createdAt = new Date(Date.now() - r.hoursAgo * 3600 * 1000).toISOString()
  const subtotal = r.items.reduce((s, it) => s + it.price * it.quantity, 0)
  const deliveryFee = subtotal > 50000 ? 0 : 1500
  return {
    id: `aord-${i + 1}`,
    orderNumber: r.id,
    customerId: `cust-${i + 10}`,
    customerName: r.customer,
    customerPhone: r.phone,
    items: r.items,
    subtotal,
    deliveryFee,
    discount: 0,
    total: subtotal + deliveryFee,
    paymentMethod: r.method,
    paymentStatus: r.payment,
    status: r.status,
    address: {
      id: `addr-${i}`,
      label: "Home",
      fullName: r.customer,
      phone: r.phone,
      line1: `${10 + i} Allen Avenue`,
      city: r.area,
      state: "Lagos",
      isDefault: true,
    },
    deliverySlot: r.hoursAgo < 4 ? "Today, express" : "Standard delivery",
    deliveryNotes: "",
    riderId: r.rider ? `rider-${r.rider === "Michael Eze" ? 1 : r.rider === "David Okafor" ? 2 : 3}` : undefined,
    riderName: r.rider,
    createdAt,
    timeline: timelineFor(r.status, createdAt),
  }
})

export const areasForAnalytics = [
  { area: "Ikeja", orders: 142, revenue: 1240000 },
  { area: "Victoria Island", orders: 98, revenue: 1610000 },
  { area: "Lekki", orders: 87, revenue: 1435000 },
  { area: "Yaba", orders: 64, revenue: 687000 },
  { area: "Surulere", orders: 51, revenue: 512000 },
  { area: "Ikoyi", orders: 43, revenue: 798000 },
]
