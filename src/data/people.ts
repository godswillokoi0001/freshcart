import type { StaffMember, Rider, Delivery, EarningsRecord, SupportTicket } from "@app-types/index"

export const staff: StaffMember[] = [
  { id: "stf-1", name: "Bola Adeyemi", email: "bola.adeyemi@freshcart.ng", role: "SUPERVISOR", status: "ACTIVE", lastActive: "2 minutes ago", ordersFulfilled: 412 },
  { id: "stf-2", name: "Chidi Nwosu", email: "chidi.nwosu@freshcart.ng", role: "STAFF", status: "ACTIVE", lastActive: "18 minutes ago", ordersFulfilled: 356 },
  { id: "stf-3", name: "Halima Bala", email: "halima.bala@freshcart.ng", role: "STAFF", status: "ACTIVE", lastActive: "1 hour ago", ordersFulfilled: 298 },
  { id: "stf-4", name: "Segun Ajayi", email: "segun.ajayi@freshcart.ng", role: "STAFF", status: "INACTIVE", lastActive: "3 days ago", ordersFulfilled: 187 },
  { id: "stf-5", name: "Ngozi Eze", email: "ngozi.eze@freshcart.ng", role: "STAFF", status: "ACTIVE", lastActive: "34 minutes ago", ordersFulfilled: 240 },
  { id: "stf-6", name: "Musa Danjuma", email: "musa.danjuma@freshcart.ng", role: "SUPERVISOR", status: "ACTIVE", lastActive: "5 minutes ago", ordersFulfilled: 501 },
]

export const riders: Rider[] = [
  { id: "rider-1", name: "Michael Eze", email: "michael.eze@freshcart.ng", phone: "+234 803 111 2222", vehicle: "Motorcycle — KMC 210", status: "ON_DELIVERY", joinedAt: "2025-06-02T09:00:00Z", deliveriesCompleted: 486, rating: 4.8, todayEarnings: 9500, weekEarnings: 61200 },
  { id: "rider-2", name: "David Okafor", email: "david.okafor@freshcart.ng", phone: "+234 806 333 4444", vehicle: "Motorcycle — Bajaj Boxer", status: "AVAILABLE", joinedAt: "2025-04-18T09:00:00Z", deliveriesCompleted: 521, rating: 4.9, todayEarnings: 7200, weekEarnings: 58800 },
  { id: "rider-3", name: "Emmanuel Bello", email: "emmanuel.bello@freshcart.ng", phone: "+234 809 555 6666", vehicle: "Motorcycle — TVS Sport", status: "AVAILABLE", joinedAt: "2025-08-11T09:00:00Z", deliveriesCompleted: 233, rating: 4.6, todayEarnings: 6800, weekEarnings: 47400 },
  { id: "rider-4", name: "Yusuf Ibrahim", email: "yusuf.ibrahim@freshcart.ng", phone: "+234 805 777 8888", vehicle: "Motorcycle — Honda Ace", status: "OFFLINE", joinedAt: "2025-02-25T09:00:00Z", deliveriesCompleted: 612, rating: 4.7, todayEarnings: 0, weekEarnings: 39600 },
  { id: "rider-5", name: "Femi Ogundipe", email: "femi.ogundipe@freshcart.ng", phone: "+234 802 999 0000", vehicle: "Motorcycle — Bajaj Boxer", status: "ON_DELIVERY", joinedAt: "2025-09-30T09:00:00Z", deliveriesCompleted: 178, rating: 4.5, todayEarnings: 8100, weekEarnings: 42300 },
  { id: "rider-6", name: "Ibrahim Sule", email: "ibrahim.sule@freshcart.ng", phone: "+234 807 222 1111", vehicle: "Motorcycle — TVS Sport", status: "OFFLINE", joinedAt: "2026-01-14T09:00:00Z", deliveriesCompleted: 94, rating: 4.4, todayEarnings: 0, weekEarnings: 18500 },
]

export const availableRiders = riders.filter((r) => r.status === "AVAILABLE")

export const deliveries: Delivery[] = [
  {
    id: "del-1", orderId: "FC-10234", customerName: "Amaka Obi", customerPhone: "+234 803 555 1234",
    address: "14B Adeola Odeku Street, Apartment 7C, Victoria Island", area: "Victoria Island",
    itemsCount: 7, deliveryFee: 1500, status: "OUT_FOR_DELIVERY",
    assignedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    deliveryNotes: "Please call when you reach the gate.",
    riderId: "rider-1",
  },
  {
    id: "del-2", orderId: "FC-10236", customerName: "Tunde Bakare", customerPhone: "+234 802 444 5555",
    address: "22 Toyin Street, Ikeja", area: "Ikeja",
    itemsCount: 12, deliveryFee: 2000, status: "UNASSIGNED",
    deliveryNotes: "Leave with the security desk if I'm not around.",
  },
  {
    id: "del-3", orderId: "FC-10237", customerName: "Ngozi Eze", customerPhone: "+234 808 123 4567",
    address: "5b Adeniyi Jones Avenue, Ikeja", area: "Ikeja",
    itemsCount: 4, deliveryFee: 1800, status: "UNASSIGNED",
    deliveryNotes: "Third floor, use the back staircase.",
  },
  {
    id: "del-4", orderId: "FC-10231", customerName: "Emeka Obi", customerPhone: "+234 803 987 6543",
    address: "8 Ramat Crescent, Ogudu GRA", area: "Ogudu",
    itemsCount: 9, deliveryFee: 1800, status: "PICKED_UP",
    assignedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    riderId: "rider-5",
  },
  {
    id: "del-5", orderId: "FC-10233", customerName: "Halima Yusuf", customerPhone: "+234 806 555 7777",
    address: "3 Abbas Close, Surulere", area: "Surulere",
    itemsCount: 6, deliveryFee: 1500, status: "OUT_FOR_DELIVERY",
    assignedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    riderId: "rider-2",
  },
  {
    id: "del-6", orderId: "FC-10229", customerName: "Sola Adeleke", customerPhone: "+234 809 222 3333",
    address: "17 Ojora Road, Ikoyi", area: "Ikoyi",
    itemsCount: 14, deliveryFee: 2200, status: "DELIVERED",
    assignedAt: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
    riderId: "rider-3",
  },
  {
    id: "del-7", orderId: "FC-10230", customerName: "Blessing Ijeoma", customerPhone: "+234 805 111 9999",
    address: "40 Awolowo Road, Ikoyi", area: "Ikoyi",
    itemsCount: 5, deliveryFee: 2000, status: "DELIVERED",
    assignedAt: new Date(Date.now() - 11 * 3600 * 1000).toISOString(),
    riderId: "rider-1",
  },
]

export const riderEarnings: EarningsRecord[] = [
  { date: "Aug 25", deliveries: 8, amount: 11200 },
  { date: "Aug 26", deliveries: 6, amount: 8400 },
  { date: "Aug 27", deliveries: 9, amount: 12600 },
  { date: "Aug 28", deliveries: 7, amount: 9800 },
  { date: "Aug 29", deliveries: 10, amount: 14000 },
  { date: "Aug 30", deliveries: 8, amount: 11200 },
  { date: "Aug 31", deliveries: 6, amount: 7200 },
]

export const riderHistory: Delivery[] = [
  { id: "h1", orderId: "FC-10229", customerName: "Sola Adeleke", customerPhone: "+234 809 222 3333", address: "17 Ojora Road, Ikoyi", area: "Ikoyi", itemsCount: 14, deliveryFee: 1400, status: "DELIVERED", assignedAt: "2026-08-31T09:12:00Z", riderId: "rider-1" },
  { id: "h2", orderId: "FC-10230", customerName: "Blessing Ijeoma", customerPhone: "+234 805 111 9999", address: "40 Awolowo Road, Ikoyi", area: "Ikoyi", itemsCount: 5, deliveryFee: 1400, status: "DELIVERED", assignedAt: "2026-08-31T10:40:00Z", riderId: "rider-1" },
  { id: "h3", orderId: "FC-10226", customerName: "Emeka Obi", customerPhone: "+234 803 987 6543", address: "8 Ramat Crescent, Ogudu GRA", area: "Ogudu", itemsCount: 9, deliveryFee: 1300, status: "DELIVERED", assignedAt: "2026-08-31T12:05:00Z", riderId: "rider-1" },
  { id: "h4", orderId: "FC-10224", customerName: "Tunde Bakare", customerPhone: "+234 802 444 5555", address: "22 Toyin Street, Ikeja", area: "Ikeja", itemsCount: 12, deliveryFee: 1500, status: "DELIVERED", assignedAt: "2026-08-31T13:32:00Z", riderId: "rider-1" },
  { id: "h5", orderId: "FC-10221", customerName: "Grace Okonkwo", customerPhone: "+234 807 888 1212", address: "12 Awolowo Way, Ikeja", area: "Ikeja", itemsCount: 7, deliveryFee: 1300, status: "DELIVERED", assignedAt: "2026-08-31T15:10:00Z", riderId: "rider-1" },
  { id: "h6", orderId: "FC-10218", customerName: "Kelechi Amadi", customerPhone: "+234 806 343 5656", address: "9 Palmer Street, Yaba", area: "Yaba", itemsCount: 4, deliveryFee: 1300, status: "DELIVERED", assignedAt: "2026-08-31T16:48:00Z", riderId: "rider-1" },
]

export const supportTickets: SupportTicket[] = [
  { id: "tkt-1", subject: "Item arrived damaged — Peak Milk 900g", customer: "Grace Okonkwo", category: "Damaged Item", priority: "HIGH", status: "OPEN", createdAt: "2026-09-01T10:20:00Z", lastReply: "2026-09-01T10:20:00Z" },
  { id: "tkt-2", subject: "Wrong item delivered (Indomie vs Macaroni)", customer: "Tunde Bakare", category: "Wrong Item", priority: "HIGH", status: "IN_PROGRESS", createdAt: "2026-08-31T16:45:00Z", lastReply: "2026-09-01T08:12:00Z" },
  { id: "tkt-3", subject: "Refund not received for cancelled order", customer: "Sola Adeleke", category: "Refund", priority: "MEDIUM", status: "IN_PROGRESS", createdAt: "2026-08-31T11:02:00Z", lastReply: "2026-08-31T15:30:00Z" },
  { id: "tkt-4", subject: "How to change delivery slot?", customer: "Ngozi Eze", category: "Delivery", priority: "LOW", status: "RESOLVED", createdAt: "2026-08-30T09:14:00Z", lastReply: "2026-08-30T10:05:00Z" },
  { id: "tkt-5", subject: "Coupon FRESH500 not applying", customer: "Emeka Obi", category: "Payments", priority: "MEDIUM", status: "RESOLVED", createdAt: "2026-08-29T18:20:00Z", lastReply: "2026-08-30T09:00:00Z" },
  { id: "tkt-6", subject: "Request for invoice on order FC-10228", customer: "Halima Yusuf", category: "Billing", priority: "LOW", status: "CLOSED", createdAt: "2026-08-28T13:11:00Z", lastReply: "2026-08-29T09:47:00Z" },
]