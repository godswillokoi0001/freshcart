// Frontend API Client connecting to PostgreSQL Express backend
const API_BASE = "/api"
const TOKEN_KEY = "freshcart_token"

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch (err) {
    console.error("Failed to store token", err)
  }
}

export function removeToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch (err) {
    console.error("Failed to remove token", err)
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`
    try {
      const errJson = await response.json()
      if (errJson.error) errorMsg = errJson.error
    } catch {
      // ignore
    }
    throw new Error(errorMsg)
  }

  return response.json()
}

// ---------------- AUTH API ----------------
export const authApi = {
  login: (credentials: { email: string; password?: string }) =>
    apiFetch<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (data: { name: string; email: string; password?: string; phone?: string; role?: string }) =>
    apiFetch<{ user: any; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  loginAsRole: (role: string) =>
    apiFetch<{ user: any; token: string }>("/auth/login-as-role", {
      method: "POST",
      body: JSON.stringify({ role }),
    }),

  getMe: () => apiFetch<{ user: any }>("/auth/me"),
}

// ---------------- PRODUCTS API ----------------
export const productApi = {
  list: (params?: {
    category?: string
    brand?: string
    search?: string
    deal?: boolean
    featured?: boolean
    sort?: string
    status?: string
    page?: number
    limit?: number
  }) => {
    const query = new URLSearchParams()
    if (params?.category) query.set("category", params.category)
    if (params?.brand) query.set("brand", params.brand)
    if (params?.search) query.set("search", params.search)
    if (params?.deal) query.set("deal", "true")
    if (params?.featured) query.set("featured", "true")
    if (params?.sort) query.set("sort", params.sort)
    if (params?.status) query.set("status", params.status)
    if (params?.page) query.set("page", String(params.page))
    if (params?.limit) query.set("limit", String(params.limit))

    const qs = query.toString() ? `?${query.toString()}` : ""
    return apiFetch<{ products: any[]; total: number; page: number; totalPages: number }>(`/products${qs}`)
  },

  get: (slugOrId: string) => apiFetch<any>(`/products/${slugOrId}`),

  create: (data: any) =>
    apiFetch<any>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiFetch<any>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/products/${id}`, {
      method: "DELETE",
    }),

  uploadImage: (imageBase64: string, filename?: string) =>
    apiFetch<{ url: string }>("/products/upload-image", {
      method: "POST",
      body: JSON.stringify({ imageBase64, filename }),
    }),
}

// ---------------- CATEGORIES & BRANDS API ----------------
export const categoryApi = {
  list: () => apiFetch<any[]>("/categories"),
  create: (data: any) =>
    apiFetch<any>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiFetch<any>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<any>(`/categories/${id}`, {
      method: "DELETE",
    }),
}

export const brandApi = {
  list: () => apiFetch<any[]>("/brands"),
}

// ---------------- CART API ----------------
export const cartApi = {
  get: () => apiFetch<{ items: any[]; subtotal: number; totalItems: number }>("/cart"),
  updateItem: (productId: string, quantity: number) =>
    apiFetch<{ success: boolean; message: string }>("/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }),
  removeItem: (productId: string) =>
    apiFetch<{ success: boolean; message: string }>(`/cart/${productId}`, {
      method: "DELETE",
    }),
  clear: () => apiFetch<{ success: boolean; message: string }>("/cart", { method: "DELETE" }),
  merge: (items: { productId: string; quantity: number }[]) =>
    apiFetch<{ success: boolean; message: string }>("/cart/merge", {
      method: "POST",
      body: JSON.stringify({ items }),
    }),
}

// ---------------- WISHLIST API ----------------
export const wishlistApi = {
  get: () => apiFetch<{ ids: string[]; items: any[]; count: number }>("/wishlist"),
  toggle: (productId: string) =>
    apiFetch<{ inWishlist: boolean; message: string }>("/wishlist/toggle", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),
  remove: (productId: string) =>
    apiFetch<{ success: boolean; message: string }>(`/wishlist/${productId}`, {
      method: "DELETE",
    }),
}

// ---------------- ADDRESSES API ----------------
export const addressApi = {
  list: () => apiFetch<any[]>("/addresses"),
  create: (data: any) =>
    apiFetch<any>("/addresses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiFetch<any>(`/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  setDefault: (id: string) =>
    apiFetch<any>(`/addresses/${id}/default`, {
      method: "POST",
    }),
  delete: (id: string) =>
    apiFetch<any>(`/addresses/${id}`, {
      method: "DELETE",
    }),
}

// ---------------- COUPONS API ----------------
export const couponApi = {
  validate: (code: string, subtotal: number) =>
    apiFetch<{
      valid: boolean
      code: string
      discount: number
      discountType: string
      discountValue: number
      message: string
    }>("/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code, subtotal }),
    }),
  list: () => apiFetch<any[]>("/coupons"),
  create: (data: any) =>
    apiFetch<any>("/coupons", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// ---------------- ORDERS & CHECKOUT API ----------------
export const orderApi = {
  checkout: (data: {
    items: { productId: string; quantity: number }[]
    deliveryAddress: any
    deliverySlot: string
    deliveryNotes?: string
    paymentMethod: "Card" | "Bank Transfer" | "Pay on Delivery"
    couponCode?: string
    guestEmail?: string
  }) =>
    apiFetch<{
      orderId: string
      orderNumber: string
      total: number
      subtotal: number
      deliveryFee: number
      discount: number
      paymentMethod: string
      paymentStatus: string
      status: string
    }>("/orders/checkout", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.status) query.set("status", params.status)
    if (params?.page) query.set("page", String(params.page))
    if (params?.limit) query.set("limit", String(params.limit))
    const qs = query.toString() ? `?${query.toString()}` : ""
    return apiFetch<any[]>(`/orders${qs}`)
  },

  get: (idOrNumber: string) => apiFetch<any>(`/orders/${idOrNumber}`),

  updateStatus: (id: string, data: { status: string; note?: string; riderId?: string; riderName?: string }) =>
    apiFetch<any>(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  cancel: (id: string, reason?: string) =>
    apiFetch<{ success: boolean; message: string }>(`/orders/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
}

// ---------------- PAYMENTS API ----------------
export const paymentApi = {
  getConfig: () => apiFetch<{ publicKey: string }>("/payments/config"),
  initialize: (orderId: string, email: string, amount: number) =>
    apiFetch<{
      authorization_url: string
      access_code: string
      reference: string
      amount: number
    }>("/payments/initialize", {
      method: "POST",
      body: JSON.stringify({ orderId, email, amount }),
    }),
  verify: (reference: string) =>
    apiFetch<{
      success: boolean
      orderNumber: string
      orderId: string
      total: number
      message: string
    }>(`/payments/verify/${reference}`),
}

// ---------------- INVENTORY API ----------------
export const inventoryApi = {
  get: () =>
    apiFetch<{
      items: any[]
      transactions: any[]
      lowStockCount: number
      totalItems: number
    }>("/inventory"),
  adjust: (productId: string, adjustment: number, type?: string, notes?: string) =>
    apiFetch<any>("/inventory/adjust", {
      method: "POST",
      body: JSON.stringify({ productId, adjustment, type, notes }),
    }),
}

// ---------------- WAREHOUSE FULFILLMENT API ----------------
export const warehouseApi = {
  getQueue: () => apiFetch<any[]>("/warehouse/queue"),
  startPrep: (orderId: string) =>
    apiFetch<any>(`/warehouse/orders/${orderId}/start-prep`, { method: "POST" }),
  packOrder: (orderId: string, items: any[]) =>
    apiFetch<any>(`/warehouse/orders/${orderId}/pack`, {
      method: "POST",
      body: JSON.stringify({ items }),
    }),
  readyDispatch: (orderId: string) =>
    apiFetch<any>(`/warehouse/orders/${orderId}/ready-dispatch`, { method: "POST" }),
}

// ---------------- RIDER DELIVERIES API ----------------
export const riderApi = {
  getDeliveries: () => apiFetch<any[]>("/rider/deliveries"),
  getDelivery: (id: string) => apiFetch<any>(`/rider/deliveries/${id}`),
  updateStatus: (id: string, status: string) =>
    apiFetch<any>(`/rider/deliveries/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  submitProofOfDelivery: (
    id: string,
    data: { recipientName: string; signatureBase64: string; deliveryNotes?: string }
  ) =>
    apiFetch<any>(`/rider/deliveries/${id}/proof-of-delivery`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// ---------------- REVIEWS API ----------------
export const reviewApi = {
  getProductReviews: (productId: string) => apiFetch<any[]>(`/reviews/product/${productId}`),
  submit: (data: { productId: string; rating: number; title: string; comment: string }) =>
    apiFetch<any>("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// ---------------- NOTIFICATIONS API ----------------
export const notificationApi = {
  list: () => apiFetch<{ notifications: any[]; unreadCount: number }>("/notifications"),
  markRead: (id: string) => apiFetch<any>(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => apiFetch<any>("/notifications/read-all", { method: "POST" }),
}

// ---------------- ADMIN DASHBOARD API ----------------
export const adminApi = {
  getDashboard: () =>
    apiFetch<{
      revenue: number
      ordersCount: number
      customersCount: number
      productsCount: number
      lowStockCount: number
      topProducts: any[]
      recentOrders: any[]
    }>("/admin/dashboard"),
  getCustomers: () => apiFetch<any[]>("/admin/customers"),
  getStaff: () => apiFetch<any[]>("/admin/staff"),
  getRiders: () => apiFetch<any[]>("/admin/riders"),
  getAuditLogs: () => apiFetch<any[]>("/admin/audit-logs"),
}
