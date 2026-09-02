import * as React from "react"
import type { Product } from "@app-types/index"
import { products } from "@data/products"
import { useToast } from "./ToastContext"

export interface CartLine {
  productId: string
  name: string
  brand: string
  unit: string
  price: number
  compareAtPrice?: number
  imageUrl: string
  stock: number
  categoryName: string
  quantity: number
}

interface CartContextValue {
  lines: CartLine[]
  itemCount: number
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  couponCode: string | null
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  applyCoupon: (code: string) => boolean
  removeCoupon: () => void
  isInCart: (productId: string) => boolean
  getQuantity: (productId: string) => number
}

const CartContext = React.createContext<CartContextValue | null>(null)

const STORAGE_KEY = "freshcart-cart"
const FREE_DELIVERY_THRESHOLD = 50000

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<CartLine[]>(loadCart)
  const [couponCode, setCouponCode] = React.useState<string | null>(null)
  const { success, error } = useToast()

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  const addItem = React.useCallback(
    (product: Product, quantity = 1) => {
      if (product.stockStatus === "OUT_OF_STOCK" || product.stockStatus === "DISCONTINUED") {
        error("Out of stock", `${product.name} is currently unavailable.`)
        return
      }
      setLines((prev) => {
        const existing = prev.find((l) => l.productId === product.id)
        if (existing) {
          const nextQty = Math.min(existing.quantity + quantity, product.stock)
          return prev.map((l) =>
            l.productId === product.id
              ? { ...l, price: product.price, compareAtPrice: product.compareAtPrice, quantity: nextQty }
              : l
          )
        }
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            brand: product.brand,
            unit: product.unit,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            imageUrl: product.imageUrl,
            stock: product.stock,
            categoryName: product.categoryName,
            quantity: Math.min(quantity, product.stock),
          },
        ]
      })
      success("Added to cart", `${product.name} (${product.unit})`)
    },
    [success, error]
  )

  const removeItem = React.useCallback(
    (productId: string) => {
      setLines((prev) => prev.filter((l) => l.productId !== productId))
    },
    []
  )

  const setQuantity = React.useCallback((productId: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) => (l.productId === productId ? { ...l, quantity } : l))
    )
  }, [])

  const clearCart = React.useCallback(() => setLines([]), [])

  const applyCoupon = React.useCallback(
    (code: string) => {
      const normalized = code.trim().toUpperCase()
      const valid = ["FRESH500", "WELCOME10", "BULK3000"]
      if (valid.includes(normalized)) {
        setCouponCode(normalized)
        success("Coupon applied", `${normalized} will be applied at checkout.`)
        return true
      }
      error("Invalid coupon", `"${code}" is not a valid or expired coupon code.`)
      return false
    },
    [success, error]
  )

  const removeCoupon = React.useCallback(() => setCouponCode(null), [])

  const subtotal = React.useMemo(
    () => lines.reduce((s, l) => s + l.price * l.quantity, 0),
    [lines]
  )
  const itemCount = React.useMemo(() => lines.reduce((s, l) => s + l.quantity, 0), [lines])
  const deliveryFee = subtotal === 0 ? 0 : subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : 1500
  const discount = React.useMemo(() => {
    if (!couponCode) return 0
    if (couponCode === "FRESH500") return Math.min(500, subtotal)
    if (couponCode === "WELCOME10") return Math.round(subtotal * 0.1)
    if (couponCode === "BULK3000") return Math.min(3000, subtotal)
    return 0
  }, [couponCode, subtotal])
  const total = Math.max(0, subtotal + deliveryFee - discount)

  const isInCart = React.useCallback(
    (productId: string) => lines.some((l) => l.productId === productId),
    [lines]
  )
  const getQuantity = React.useCallback(
    (productId: string) => lines.find((l) => l.productId === productId)?.quantity ?? 0,
    [lines]
  )

  const value: CartContextValue = {
    lines, itemCount, subtotal, deliveryFee, discount, total, couponCode,
    addItem, removeItem, setQuantity, clearCart, applyCoupon, removeCoupon, isInCart, getQuantity,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = React.useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}

export { FREE_DELIVERY_THRESHOLD }
