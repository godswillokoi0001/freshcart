import * as React from "react"
import { Link } from "react-router-dom"
import {
  Truck,
  ShieldCheck,
  Percent,
  ShoppingBag,
} from "lucide-react"
import { ProductGrid } from "@components/customer/ProductCard"
import { CategoryCard } from "@components/customer/CategoryCard"
import { categories } from "@data/categories"
import { dealProducts, featuredProducts } from "@data/products"
import { discountPercent, formatNaira } from "@lib/format"
import { ProductImage } from "@components/shared/ProductImage"

const deals = dealProducts.slice(0, 5)

/**
 * Hero — fc-earth background, Fraunces italic headline.
 *
 * The ONE animated moment: headline words stagger in on load via
 * CSS animation-delay on individual word spans. Nothing else
 * on this page moves.
 */
function Hero() {
  // Split headline into words for the stagger animation
  const line1 = ["Fresh", "Groceries,"]
  const line2 = ["Straight", "from", "the", "Market."]

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: "var(--color-fc-earth)" }}>
      {/* Diagonal geometry — content-driven, not decorative blur orbs */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 hidden lg:block"
        style={{ background: "linear-gradient(135deg, transparent 40%, #2D6A2F22 100%)" }}
      />

      <div className="container relative z-10 grid items-stretch gap-0 lg:grid-cols-12 lg:min-h-[540px]">
        {/* Left — headline, copy, CTA */}
        <div className="flex flex-col justify-center py-14 lg:col-span-7 lg:pr-12 lg:py-20">
          {/* No ALL-CAPS eyebrow — the headline leads */}
          <h1 className="font-display italic font-bold leading-[1.05] text-fc-cream"
              style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}>
            {[...line1, ...line2].map((word, i) => {
              const isNewLine = i === line1.length
              return (
                <React.Fragment key={i}>
                  {isNewLine && <br />}
                  <span
                    className="fc-hero-word"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {word}
                    {i < line1.length + line2.length - 1 ? "\u00A0" : ""}
                  </span>
                </React.Fragment>
              )
            })}
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed" style={{ color: "var(--color-fc-smoke-light)" }}>
            Rice, palm oil, fresh tomatoes, Indomie, whole chicken, eggs —
            packed at our Lagos warehouse and at your door the same day.
          </p>

          {/* Single primary CTA — no arrows, no secondary ghost duplicate */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-bold text-fc-earth transition-colors hover:bg-fc-amber active:scale-[0.98]"
              style={{ backgroundColor: "var(--color-fc-amber)", borderRadius: 0 }}
            >
              <ShoppingBag className="h-4 w-4" />
              Shop the Supermarket
            </Link>
            <Link
              to="/deals"
              className="text-sm font-semibold underline underline-offset-4 transition-colors hover:text-fc-amber"
              style={{ color: "var(--color-fc-smoke-light)" }}
            >
              Today's deals
            </Link>
          </div>

          {/* Stats — plain numbers, no icon decoration */}
          <div className="mt-10 grid grid-cols-3 gap-6 border-t pt-8"
               style={{ borderColor: "rgba(247,242,232,0.12)" }}>
            <div>
              <p className="text-2xl font-bold text-fc-cream sm:text-3xl">5,000+</p>
              <p className="mt-1 text-xs" style={{ color: "var(--color-fc-smoke-light)" }}>
                Products in stock
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-fc-cream sm:text-3xl">Same day</p>
              <p className="mt-1 text-xs" style={{ color: "var(--color-fc-smoke-light)" }}>
                Dispatch across Lagos
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--color-fc-amber)" }}>
                100%
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--color-fc-smoke-light)" }}>
                Freshness guarantee
              </p>
            </div>
          </div>
        </div>

        {/* Right — stacked product photography, no glass card */}
        <div className="hidden lg:flex lg:col-span-5 items-stretch">
          <div className="relative w-full overflow-hidden" style={{ clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0 100%)" }}>
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"
              alt="Fresh produce supermarket aisle"
              className="h-full w-full object-cover"
            />
            {/* Bottom overlay — restrained, content-only */}
            <div className="absolute inset-x-0 bottom-0 p-6"
                 style={{ background: "linear-gradient(to top, rgba(26,18,8,0.85) 0%, transparent 100%)" }}>
              <p className="text-xs font-semibold text-fc-cream/60 uppercase tracking-wide mb-1">
                Farm-checked daily
              </p>
              <p className="text-sm font-bold text-fc-cream">
                Quality you can see before it ships.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Trust bar — fc-market strip. Copy only. No icons. No cards.
 * The claims are concrete and specific, not vague value-prop speak.
 */
function TrustBar() {
  const claims = [
    "Packed and dispatched same day, Mon–Sat",
    "Hand-sorted produce or your money back",
    "Pay on delivery available across Lagos",
  ]

  return (
    <div style={{ backgroundColor: "var(--color-fc-market)" }}>
      <div className="container py-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-white/25">
          {claims.map((claim) => (
            <p key={claim} className="text-center text-sm font-semibold text-white sm:px-4">
              {claim}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * DealStrip — fc-cream background, Fraunces section heading.
 * Cards: sharp corners, leaf border on hover only, no lift.
 */
function DealStrip() {
  return (
    <section style={{ backgroundColor: "var(--color-fc-cream)" }}>
      <div className="container py-12">
        {/* Section heading — Fraunces, direct copy */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="font-display italic font-bold text-fc-earth"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", lineHeight: 1.1 }}>
              Today's best prices
            </h2>
            <p className="mt-2 text-sm text-fc-smoke">
              Staple groceries at below-market rates — stock sells fast.
            </p>
          </div>
          <Link
            to="/deals"
            className="shrink-0 text-sm font-semibold text-fc-leaf underline underline-offset-4 hover:text-fc-leaf-700 transition-colors"
          >
            See all deals
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-px bg-fc-cream-200 sm:grid-cols-3 lg:grid-cols-5">
          {deals.map((p) => {
            const discount = discountPercent(p.price, p.compareAtPrice)
            return (
              <Link
                key={p.id}
                to={`/products/${p.slug}`}
                className="group relative flex flex-col overflow-hidden bg-white border-0 transition-colors hover:border-fc-leaf"
                style={{ borderRadius: 0 }}
              >
                <div className="relative aspect-square w-full overflow-hidden bg-fc-chalk">
                  <ProductImage
                    productName={p.name}
                    categoryName={p.categoryName}
                    imageUrl={p.imageUrl}
                    className="h-full w-full object-cover"
                    size="md"
                  />
                  {discount && (
                    <span
                      className="absolute left-0 top-3 bg-fc-market px-2.5 py-0.5 text-[11px] font-bold text-white"
                      style={{ borderRadius: 0 }}
                    >
                      {discount}% OFF
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-3">
                  <span className="text-xs font-semibold text-fc-leaf line-clamp-1">
                    {p.brand}
                  </span>
                  <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-fc-earth group-hover:text-fc-market transition-colors">
                    {p.name}
                  </p>
                  <span className="text-xs text-fc-smoke mt-0.5">{p.unit}</span>

                  <div className="mt-auto pt-2 flex items-baseline gap-2">
                    <span className="text-base font-bold text-fc-earth">
                      {formatNaira(p.price)}
                    </span>
                    {p.compareAtPrice && (
                      <span className="text-xs text-fc-smoke line-through">
                        {formatNaira(p.compareAtPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/**
 * CategoryGrid — fc-chalk background, rectangular tiles (not circles).
 * Horizontal scroll on mobile so aisles feel like a market row.
 */
function CategoryGrid() {
  return (
    <section style={{ backgroundColor: "var(--color-fc-chalk)" }} className="border-y border-fc-cream-200">
      <div className="container py-12">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <h2 className="font-display italic font-bold text-fc-earth"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", lineHeight: 1.1 }}>
              Shop by aisle
            </h2>
            <p className="mt-2 text-sm text-fc-smoke">
              Fresh farm, dry pantry, butchery, dairy and home.
            </p>
          </div>
          <Link
            to="/categories"
            className="hidden sm:block shrink-0 text-sm font-semibold text-fc-leaf underline underline-offset-4 hover:text-fc-leaf-700 transition-colors"
          >
            All 22 aisles
          </Link>
        </div>

        {/* Grid — rectangular tiles, no circles */}
        <div className="grid grid-cols-2 gap-px bg-fc-cream-200 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {categories.slice(0, 16).map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>

        <Link
          to="/categories"
          className="mt-5 block text-center text-sm font-semibold text-fc-leaf underline underline-offset-4 hover:text-fc-leaf-700 sm:hidden"
        >
          All 22 aisles
        </Link>
      </div>
    </section>
  )
}

/**
 * Promo band — fc-leaf background, Fraunces headline.
 * Coupon code looks like a torn paper ticket: fc-amber bg, slight rotation.
 * The one deliberately decorative element — restrained to this single component.
 */
function PromoBand() {
  return (
    <section style={{ backgroundColor: "var(--color-fc-leaf)" }}>
      <div className="container py-14">
        <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-lg">
            <h2
              className="font-display italic font-bold text-fc-cream"
              style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", lineHeight: 1.05 }}
            >
              ₦500 off your first grocery run.
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "rgba(247,242,232,0.75)" }}>
              Stock your kitchen with fresh Nigerian staples. Works on orders above ₦5,000.
              Free delivery on orders over ₦50,000.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-fc-leaf transition-colors hover:bg-fc-amber"
              style={{ backgroundColor: "var(--color-fc-cream)", borderRadius: 0 }}
            >
              Start shopping
            </Link>
          </div>

          {/* Coupon ticket — the one deliberate decorative flourish */}
          <div className="fc-ticket shrink-0">
            <div
              className="border-2 border-dashed border-fc-leaf-700 px-8 py-5 text-center shadow-md"
              style={{ backgroundColor: "var(--color-fc-amber)", borderRadius: 0 }}
            >
              <p className="text-xs font-semibold text-fc-earth/60 uppercase tracking-widest mb-1">
                Promo code
              </p>
              <p className="text-3xl font-bold tracking-tight text-fc-earth font-display italic">
                FRESH500
              </p>
              <p className="mt-1 text-xs text-fc-earth/70">
                New customers · Min. order ₦5,000
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Popular strip — fc-chalk background, same sharp card system.
 */
function PopularStrip() {
  return (
    <section style={{ backgroundColor: "var(--color-fc-chalk)" }}>
      <div className="container py-12">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <h2 className="font-display italic font-bold text-fc-earth"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", lineHeight: 1.1 }}>
              Popular in Lagos this week
            </h2>
            <p className="mt-2 text-sm text-fc-smoke">
              Most ordered by local households — ordered and delivered same day.
            </p>
          </div>
          <Link
            to="/shop"
            className="hidden sm:block shrink-0 text-sm font-semibold text-fc-leaf underline underline-offset-4 hover:text-fc-leaf-700 transition-colors"
          >
            Full supermarket
          </Link>
        </div>

        <ProductGrid products={featuredProducts.slice(0, 10)} />
      </div>
    </section>
  )
}

export function HomePage() {
  return (
    <div>
      <Hero />
      <TrustBar />
      <DealStrip />
      <CategoryGrid />
      <PromoBand />
      <PopularStrip />
    </div>
  )
}
