import * as React from "react"
import type { Product } from "@app-types/index"
import { products } from "@data/products"
import { useToast } from "./ToastContext"
import { useAuth } from "./AuthContext"
import { cartApi, couponApi } from "../services/api"

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
  applyCoupon: (code: string) => Promise<boolean>
  removeCoupon: () => void
  isInCart: (productId: string) => boolean
  getQuantity: (productId: string) => number
}

const CartContext = React.createContext<CartContextValue | null>(null)

const STORAGE_KEY = "freshcart-cart"
const FREE_DELIVERY_THRESHOLD = 100000

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: CartLine[] = JSON.parse(raw)
    return parsed.map((item) => {
      if (!item.imageUrl) {
        const found = products.find((p) => p.id === item.productId)
        if (found?.imageUrl) {
          return { ...item, imageUrl: found.imageUrl }
        }
      }
      return item
    })
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<CartLine[]>(loadCart)
  const [couponCode, setCouponCode] = React.useState<string | null>(null)
  const [serverDiscount, setServerDiscount] = React.useState<number>(0)
  const { success, error } = useToast()
  const { isSignedIn } = useAuth()

  // Sync to localStorage
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  // Merge or sync with backend cart on sign in
  React.useEffect(() => {
    if (isSignedIn) {
      async function syncWithBackend() {
        try {
          if (lines.length > 0) {
            await cartApi.merge(lines.map((l) => ({ productId: l.productId, quantity: l.quantity })))
          }
          const backendCart = await cartApi.get()
          if (backendCart.items && backendCart.items.length > 0) {
            const mapped: CartLine[] = backendCart.items.map((itm: any) => ({
              productId: itm.productId,
              name: itm.name,
              brand: itm.brand || "",
              unit: itm.unit || "item",
              price: itm.price,
              compareAtPrice: itm.compareAtPrice,
              imageUrl: itm.imageUrl,
              stock: itm.stock,
              categoryName: itm.categoryName || "",
              quantity: itm.quantity,
            }))
            setLines(mapped)
          }
        } catch (e) {
          console.warn("Cart backend sync:", e)
        }
      }
      syncWithBackend()
    }
  }, [isSignedIn])

  const addItem = React.useCallback(
    (product: Product, quantity = 1) => {
      if (product.stockStatus === "OUT_OF_STOCK" || product.stockStatus === "DISCONTINUED") {
        error("Out of stock", `${product.name} is currently unavailable.`)
        return
      }

      setLines((prev) => {
        const existing = prev.find((l) => l.productId === product.id)
        let nextQty = quantity
        if (existing) {
          nextQty = Math.min(existing.quantity + quantity, product.stock)
        } else {
          nextQty = Math.min(quantity, product.stock)
        }

        if (isSignedIn) {
          cartApi.updateItem(product.id, nextQty).catch((e) => console.warn("Cart update error:", e))
        }

        if (existing) {
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
            quantity: nextQty,
          },
        ]
      })
      success("Added to cart", `${product.name} (${product.unit})`)
    },
    [success, error, isSignedIn]
  )

  const removeItem = React.useCallback(
    (productId: string) => {
      setLines((prev) => prev.filter((l) => l.productId !== productId))
      if (isSignedIn) {
        cartApi.removeItem(productId).catch((e) => console.warn("Cart remove error:", e))
      }
    },
    [isSignedIn]
  )

  const setQuantity = React.useCallback(
    (productId: string, quantity: number) => {
      setLines((prev) => {
        if (quantity <= 0) {
          if (isSignedIn) cartApi.removeItem(productId).catch((e) => console.warn(e))
          return prev.filter((l) => l.productId !== productId)
        }
        if (isSignedIn) cartApi.updateItem(productId, quantity).catch((e) => console.warn(e))
        return prev.map((l) => (l.productId === productId ? { ...l, quantity } : l))
      })
    },
    [isSignedIn]
  )

  const clearCart = React.useCallback(() => {
    setLines([])
    setCouponCode(null)
    setServerDiscount(0)
    if (isSignedIn) {
      cartApi.clear().catch((e) => console.warn(e))
    }
  }, [isSignedIn])

  const subtotal = React.useMemo(
    () => lines.reduce((s, l) => s + l.price * l.quantity, 0),
    [lines]
  )

  const applyCoupon = React.useCallback(
    async (code: string) => {
      const normalized = code.trim().toUpperCase()
      try {
        const res = await couponApi.validate(normalized, subtotal)
        if (res.valid) {
          setCouponCode(res.code)
          setServerDiscount(res.discount)
          success("Coupon applied", res.message)
          return true
        } else {
          error("Invalid coupon", "Coupon could not be applied.")
          return false
        }
      } catch (err: any) {
        error("Invalid coupon", err.message || `"${code}" is not valid.`)
        return false
      }
    },
    [subtotal, success, error]
  )

  const removeCoupon = React.useCallback(() => {
    setCouponCode(null)
    setServerDiscount(0)
  }, [])

  const itemCount = React.useMemo(() => lines.reduce((s, l) => s + l.quantity, 0), [lines])
  const deliveryFee = subtotal === 0 ? 0 : subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : 1500

  // Recalculate discount if lines change and coupon is applied
  const discount = React.useMemo(() => {
    if (!couponCode) return 0
    if (serverDiscount > 0) return Math.min(serverDiscount, subtotal)
    return 0
  }, [couponCode, serverDiscount, subtotal])

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
    lines,
    itemCount,
    subtotal,
    deliveryFee,
    discount,
    total,
    couponCode,
    addItem,
    removeItem,
    setQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    isInCart,
    getQuantity,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = React.useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}

export { FREE_DELIVERY_THRESHOLD }
