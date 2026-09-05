import * as React from "react"
import { Link, useParams } from "react-router-dom"
import { ChevronRight, Heart, ShoppingCart, Truck, RotateCcw, ShieldCheck, Minus, Plus } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/Tabs"
import { EmptyState } from "@components/ui/EmptyState"
import { ProductImage } from "@components/shared/ProductImage"
import { RatingStars } from "@components/shared/RatingStars"
import { StockStatusBadge } from "@components/shared/StatusBadges"
import { ReviewCard } from "@components/customer/ReviewCard"
import { ProductCard } from "@components/customer/ProductCard"
import { productBySlug, products } from "@data/products"
import { reviewsForProduct } from "@data/reviews"
import { formatNaira, discountPercent } from "@lib/format"
import { useCart } from "@context/CartContext"
import { useWishlist } from "@context/WishlistContext"
import type { Review } from "@app-types/index"
import { cn } from "@lib/utils"

export function ProductPage() {
  const { product } = useParams()
  const data = productBySlug(product ?? "")
  const [qty, setQty] = React.useState(1)
  const { addItem } = useCart()
  const { has, toggle } = useWishlist()

  const [reviewsList, setReviewsList] = React.useState<Review[]>(() =>
    data ? reviewsForProduct(data.id) : []
  )
  const [showReviewForm, setShowReviewForm] = React.useState(false)
  const [newReviewRating, setNewReviewRating] = React.useState(5)
  const [newReviewTitle, setNewReviewTitle] = React.useState("")
  const [newReviewComment, setNewReviewComment] = React.useState("")
  const [newReviewName, setNewReviewName] = React.useState("")
  const [selectedImage, setSelectedImage] = React.useState(() => data?.imageUrl || "")

  React.useEffect(() => {
    if (data) {
      setSelectedImage(data.imageUrl)
      setReviewsList(reviewsForProduct(data.id))
    }
  }, [data?.id, data?.imageUrl])

  if (!data) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={ShoppingCart}
          title="Product not found"
          description="This product may have been removed or is no longer available."
          action={{ label: "Back to shop", href: "/shop" }}
        />
      </div>
    )
  }

  const discount = discountPercent(data.price, data.compareAtPrice)

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReviewTitle.trim() || !newReviewComment.trim()) return

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId: data.id,
      customerName: newReviewName.trim() || "Verified FreshCart Shopper",
      rating: newReviewRating,
      title: newReviewTitle.trim(),
      comment: newReviewComment.trim(),
      date: new Date().toISOString().split("T")[0],
      verifiedPurchase: true,
      helpfulCount: 0,
    }

    setReviewsList([newRev, ...reviewsList])
    setNewReviewTitle("")
    setNewReviewComment("")
    setShowReviewForm(false)
  }

  const related = products
    .filter((p) => p.categoryId === data.categoryId && p.id !== data.id)
    .slice(0, 5)
  const outOfStock = data.stockStatus === "OUT_OF_STOCK"

  const galleryImages = data.images && data.images.length > 0
    ? data.images
    : [data.imageUrl]

  return (
    <div className="container py-8">
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-navy-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-fresh-700">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/shop" className="hover:text-fresh-700">Shop</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to={`/categories/${data.categoryId}`} className="hover:text-fresh-700">{data.categoryName}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="max-w-[16rem] truncate font-medium text-navy-900">{data.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <ProductImage
              productName={data.name}
              categoryName={data.categoryName}
              imageUrl={selectedImage}
              className="aspect-square w-full object-cover"
              size="xl"
            />
          </div>
          {galleryImages.length > 1 && (
            <div className="mt-3.5 flex flex-wrap gap-2.5">
              {galleryImages.map((img, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={cn(
                    "relative h-16 w-16 overflow-hidden rounded-xl border-2 transition-all",
                    selectedImage === img
                      ? "border-emerald-600 ring-2 ring-emerald-600/30"
                      : "border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300"
                  )}
                >
                  <ProductImage
                    productName={data.name}
                    categoryName={data.categoryName}
                    imageUrl={img}
                    className="h-full w-full object-cover"
                    size="sm"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium uppercase tracking-wide text-navy-400">{data.brand}</p>
            <StockStatusBadge status={data.stockStatus} />
          </div>
          <h1 className="mt-1 text-2xl font-bold text-navy-900 sm:text-3xl">{data.name}</h1>
          <p className="mt-1 text-sm text-navy-500">{data.unit}</p>
          <div className="mt-2 flex items-center gap-2">
            <RatingStars rating={data.rating} showValue count={data.reviewCount} />
            <a href="#reviews" className="text-sm text-fresh-700 hover:underline">
              Read reviews
            </a>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-navy-900">{formatNaira(data.price)}</span>
            {data.compareAtPrice && (
              <>
                <span className="text-lg text-navy-400 line-through">{formatNaira(data.compareAtPrice)}</span>
                <span className="rounded-full bg-danger-50 px-2 py-0.5 text-sm font-semibold text-danger-600">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          <p className="mt-4 leading-relaxed text-navy-600">{data.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-md border border-navy-200">
              <button
                type="button"
                aria-label="Decrease quantity"
                className="flex h-11 w-11 items-center justify-center rounded-l-md text-navy-600 hover:bg-navy-50 disabled:opacity-40"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1 || outOfStock}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-semibold text-navy-900">{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                className="flex h-11 w-11 items-center justify-center rounded-r-md text-navy-600 hover:bg-navy-50 disabled:opacity-40"
                onClick={() => setQty((q) => Math.min(data.stock, q + 1))}
                disabled={qty >= data.stock || outOfStock}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button size="lg" className="flex-1" disabled={outOfStock} onClick={() => addItem(data, qty)}>
              <ShoppingCart className="h-5 w-5" />
              {outOfStock ? "Out of stock" : "Add to Cart"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              aria-label={has(data.id) ? "Remove from wishlist" : "Save to wishlist"}
              onClick={() => toggle(data)}
            >
              <Heart className={cn("h-5 w-5", has(data.id) && "fill-danger-500 text-danger-500")} />
            </Button>
          </div>
          {data.stockStatus === "LOW_STOCK" && (
            <p className="mt-3 text-sm font-medium text-warning-600">
              Only {data.stock} left in stock — order soon.
            </p>
          )}

          <div className="mt-6 space-y-3 rounded-lg border border-navy-200 bg-navy-50 p-4">
            <div className="flex items-start gap-3 text-sm">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-fresh-700" />
              <p className="text-navy-600">
                <span className="font-semibold text-navy-900">Same-day delivery</span> — order before 2 PM for delivery today, 7 days a week.
              </p>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-fresh-700" />
              <p className="text-navy-600">
                <span className="font-semibold text-navy-900">Freshness guarantee</span> — not happy with the quality? We refund or replace.
              </p>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-fresh-700" />
              <p className="text-navy-600">
                <span className="font-semibold text-navy-900">Free delivery</span> on orders over ₦50,000.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="information" className="mt-10">
        <TabsList>
          <TabsTrigger value="information">Product Information</TabsTrigger>
          <TabsTrigger value="delivery">Delivery & Returns</TabsTrigger>
          <TabsTrigger value="reviews" id="reviews">Reviews ({reviewsList.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="information" className="mt-4">
          <div className="rounded-lg border border-navy-200 p-6">
            <dl className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
              {data.details.map((d) => (
                <div key={d.label} className="flex justify-between gap-4 border-b border-navy-100 pb-2 last:border-b-0 sm:border-b">
                  <dt className="text-sm font-medium text-navy-500">{d.label}</dt>
                  <dd className="text-right text-sm font-medium text-navy-900">{d.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </TabsContent>
        <TabsContent value="delivery" className="mt-4">
          <div className="rounded-lg border border-navy-200 p-6 text-sm leading-relaxed text-navy-600">
            <h3 className="mb-2 font-semibold text-navy-900">Delivery</h3>
            <p>
              We deliver across Lagos daily with express slots (2 hours) and scheduled slots (morning, afternoon,
              evening). Orders above ₦50,000 qualify for free standard delivery.
            </p>
            <h3 className="mb-2 mt-5 font-semibold text-navy-900">Returns</h3>
            <p>
              Fresh items can be returned at the point of delivery if they don't meet our freshness standard.
              Sealed pantry items can be returned within 24 hours unopened. Contact support from your order page
              to arrange a pickup or refund.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="mt-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-extrabold text-slate-900">{data.rating.toFixed(1)}</p>
                  <RatingStars rating={data.rating} className="mt-1" />
                  <p className="mt-1 text-xs text-slate-500">{reviewsList.length} verified reviews</p>
                </div>
              </div>
              <Button
                variant={showReviewForm ? "outline" : "default"}
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? "Cancel Review" : "Write a Customer Review"}
              </Button>
            </div>

            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="my-6 rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
                <h4 className="font-bold text-slate-900">Share your grocery experience</h4>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Chioma A."
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Rating (1 to 5 Stars)</label>
                    <select
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value={5}>5 Stars — Excellent Quality</option>
                      <option value={4}>4 Stars — Very Good</option>
                      <option value={3}>3 Stars — Average / Acceptable</option>
                      <option value={2}>2 Stars — Below Expectations</option>
                      <option value={1}>1 Star — Disappointed</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700">Headline / Summary</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Great quality, neatly packaged and fresh"
                      value={newReviewTitle}
                      onChange={(e) => setNewReviewTitle(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700">Your Review</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Tell other shoppers about the freshness, packaging, or taste..."
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button type="submit" size="sm">
                    Submit Verified Review
                  </Button>
                </div>
              </form>
            )}

            {reviewsList.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No reviews yet for this product. Be the first to share your experience!
              </p>
            ) : (
              <div className="mt-6 divide-y divide-slate-100">
                {reviewsList.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-navy-900">You may also like</h2>
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
