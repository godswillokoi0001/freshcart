export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "DISCONTINUED"

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "PACKED"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"

export type PaymentStatus = "PAID" | "UNPAID" | "REFUNDED" | "PENDING"

export type RiderStatus = "AVAILABLE" | "ON_DELIVERY" | "OFFLINE"

export type StaffRole = "STAFF" | "SUPERVISOR"
export type AdminRole = "ADMIN"
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED"

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  imageUrl: string
  productCount: number
  status: "ACTIVE" | "HIDDEN"
}

export interface Brand {
  id: string
  name: string
  logoUrl?: string
  productCount: number
  status: "ACTIVE" | "HIDDEN"
}

export interface Review {
  id: string
  productId: string
  customerName: string
  rating: number
  title: string
  comment: string
  date: string
  verifiedPurchase: boolean
  helpfulCount: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  categoryId: string
  categoryName: string
  brand: string
  unit: string
  price: number
  compareAtPrice?: number
  sku: string
  stock: number
  stockStatus: StockStatus
  imageUrl: string
  images: string[]
  rating: number
  reviewCount: number
  status: "ACTIVE" | "ARCHIVED"
  createdAt: string
  updatedAt: string
  isFeatured?: boolean
  isDeal?: boolean
  details: { label: string; value: string }[]
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface WishlistItem {
  productId: string
  addedAt: string
}

export interface OrderItem {
  productId: string
  name: string
  brand: string
  unit: string
  imageUrl: string
  price: number
  quantity: number
  substitutionNote?: string
  pickedStatus?: "PICKED" | "OUT_OF_STOCK" | "SUBSTITUTED"
}

export interface OrderTimelineEvent {
  label: string
  description?: string
  timestamp: string
  completed: boolean
  current?: boolean
}

export interface Address {
  id: string
  label: string
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  isDefault: boolean
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerPhone: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  paymentMethod: "Card" | "Bank Transfer" | "Pay on Delivery"
  paymentStatus: PaymentStatus
  status: OrderStatus
  address: Address
  deliverySlot: string
  deliveryNotes?: string
  riderId?: string
  riderName?: string
  createdAt: string
  timeline: OrderTimelineEvent[]
  couponCode?: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  status: UserStatus
  joinedAt: string
  ordersCount: number
  totalSpent: number
  lastOrderAt?: string
  addresses: Address[]
}

export interface StaffMember {
  id: string
  name: string
  email: string
  role: StaffRole
  status: UserStatus
  lastActive: string
  ordersFulfilled: number
}

export interface Rider {
  id: string
  name: string
  email: string
  phone: string
  vehicle: string
  status: RiderStatus
  joinedAt: string
  deliveriesCompleted: number
  rating: number
  todayEarnings: number
  weekEarnings: number
}

export interface Delivery {
  id: string
  orderId: string
  customerName: string
  customerPhone: string
  address: string
  area: string
  itemsCount: number
  deliveryFee: number
  status: "ASSIGNED" | "ACCEPTED" | "GO_TO_STORE" | "PICKED_UP" | "OUT_FOR_DELIVERY" | "DELIVERED" | "UNASSIGNED"
  assignedAt?: string
  deliveryNotes?: string
  riderId?: string
}

export interface Coupon {
  id: string
  code: string
  discountType: "PERCENTAGE" | "FIXED"
  discountValue: number
  minOrder: number
  expiresAt: string
  usageLimit: number
  usedCount: number
  status: "ACTIVE" | "EXPIRED" | "DISABLED"
}

export interface Promotion {
  id: string
  title: string
  description: string
  type: "DISCOUNT" | "BANNER" | "BUNDLE"
  status: "ACTIVE" | "SCHEDULED" | "ENDED"
  startDate: string
  endDate: string
  bannerUrl?: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "ORDER" | "DELIVERY" | "PROMO" | "ACCOUNT"
  read: boolean
  createdAt: string
}

export interface AuditLog {
  id: string
  timestamp: string
  user: string
  role: string
  action: string
  resource: string
  status: "SUCCESS" | "FAILED"
  details?: string
}

export interface SecurityEvent {
  id: string
  event: string
  severity: "LOW" | "MEDIUM" | "HIGH"
  user: string
  ipAddress: string
  timestamp: string
}

export interface AdminAccount {
  id: string
  name: string
  email: string
  role: "SUPER_ADMIN" | "ADMIN"
  status: UserStatus
  lastActive: string
  permissions: string[]
  createdAt: string
}

export interface SupportTicket {
  id: string
  subject: string
  customer: string
  category: string
  priority: "LOW" | "MEDIUM" | "HIGH"
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  createdAt: string
  lastReply: string
}

export interface EarningsRecord {
  date: string
  deliveries: number
  amount: number
}