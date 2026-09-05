import * as React from "react"
import type { Product } from "@app-types/index"
import { products as allProducts } from "@data/products"
import { useToast } from "./ToastContext"
import { useAuth } from "./AuthContext"
import { wishlistApi } from "../services/api"

interface WishlistContextValue {
  ids: string[]
  toggle: (product: Product) => void
  has: (productId: string) => boolean
  products: Product[]
  count: number
}

const WishlistContext = React.createContext<WishlistContextValue | null>(null)

const STORAGE_KEY = "freshcart-wishlist"

function load(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = React.useState<string[]>(load)
  const { success } = useToast()
  const { isSignedIn, token } = useAuth()

  // Sync with backend wishlist on login
  React.useEffect(() => {
    if (isSignedIn && token) {
      wishlistApi
        .get()
        .then((res) => {
          if (res && Array.isArray(res.ids)) {
            setIds(res.ids)
          }
        })
        .catch((e) => console.warn("Wishlist fetch error:", e))
    }
  }, [isSignedIn, token])

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  }, [ids])

  const toggle = React.useCallback(
    (product: Product) => {
      setIds((prev) => {
        const exists = prev.includes(product.id)
        if (exists) {
          success("Removed from wishlist", product.name)
          if (isSignedIn) wishlistApi.toggle(product.id).catch((e) => console.warn(e))
          return prev.filter((id) => id !== product.id)
        } else {
          success("Saved to wishlist", product.name)
          if (isSignedIn) wishlistApi.toggle(product.id).catch((e) => console.warn(e))
          return [...prev, product.id]
        }
      })
    },
    [success, isSignedIn]
  )

  const has = React.useCallback((productId: string) => ids.includes(productId), [ids])

  const products = React.useMemo(
    () => ids.map((id) => allProducts.find((p) => p.id === id)).filter((p): p is Product => Boolean(p)),
    [ids]
  )

  return (
    <WishlistContext.Provider value={{ ids, toggle, has, products, count: ids.length }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = React.useContext(WishlistContext)
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider")
  return ctx
}
