import { Link } from "react-router-dom"
import { ChevronRight, Heart, Trash2, ShoppingCart, AlertCircle } from "lucide-react"
import { Button } from "@components/ui/Button"
import { EmptyState } from "@components/ui/EmptyState"
import { ProductCard } from "@components/customer/ProductCard"
import { useWishlist } from "@context/WishlistContext"
import { useAuth } from "@context/AuthContext"
import { cn } from "@lib/utils"

export function WishlistPage() {
  const { user } = useAuth()
  const { products, count, has, toggle } = useWishlist()

  if (!user) {
    return (
      <div className="container py-8">
        <h1 className="mb-2 text-2xl font-bold text-navy-900">Your Wishlist</h1>
        <EmptyState
          icon={Heart}
          title="Please sign in to view your wishlist"
          description="Sign in to save products and access them from any device."
          action={{ label: "Sign In", href: "/sign-in" }}
          secondaryAction={{ label: "Create Account", href: "/sign-up" }}
        />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">
          Your Wishlist <span className="text-base font-normal text-navy-500">({count} item{count !== 1 ? "s" : ""})</span>
        </h1>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="You haven't saved any products yet."
          description="Browse our aisles and tap the heart icon on any product to save it for later."
          action={{ label: "Start shopping", href: "/shop" }}
          secondaryAction={{ label: "See today's deals", href: "/deals" }}
        />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              if (confirm("Remove all items from your wishlist?")) {
                products.forEach((p) => toggle(p))
              }
            }}>
              <Trash2 className="h-4 w-4" /> Clear Wishlist
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
