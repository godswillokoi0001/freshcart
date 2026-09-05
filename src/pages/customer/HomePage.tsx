import * as React from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Clock,
  Percent,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from "lucide-react"
import { ProductGrid } from "@components/customer/ProductCard"
import { CategoryCard } from "@components/customer/CategoryCard"
import { categories } from "@data/categories"
import { dealProducts, featuredProducts } from "@data/products"
import { discountPercent, formatNaira } from "@lib/format"
import { ProductImage } from "@components/shared/ProductImage"

const deals = dealProducts.slice(0, 5)

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white">
      {/* Background soft ambient orbs */}
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="container relative z-10 grid items-center gap-12 py-12 lg:grid-cols-12 lg:py-20">
        {/* Left copy & CTA */}
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-800/40 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xs">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span>Guaranteed Same-Day Delivery Across Lagos</span>
          </div>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.12]">
            Fresh Groceries &amp; Market Staples,{" "}
            <span className="text-emerald-400">At Real Supermarket Prices.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Shop rice, beans, fresh farm vegetables, chilled meat, dairy, and household essentials. Packaged with care and delivered directly to your doorstep.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all"
            >
              <ShoppingBag className="h-4 w-4" />
              Shop Supermarket
            </Link>
            <Link
              to="/deals"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xs hover:bg-white/15 transition-all"
            >
              <Percent className="h-4 w-4 text-amber-400" />
              Explore Deals
            </Link>
          </div>

          {/* Supermarket Metric Counters */}
          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-emerald-800/60 pt-6">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">5,000+</p>
              <p className="text-xs font-medium text-slate-400 mt-0.5">Fresh Products</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">7 Days</p>
              <p className="text-xs font-medium text-slate-400 mt-0.5">Express Dispatch</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">100%</p>
              <p className="text-xs font-medium text-slate-400 mt-0.5">Freshness Assured</p>
            </div>
          </div>
        </div>

        {/* Right visual card showcase */}
        <div className="relative lg:col-span-5">
          <div className="relative mx-auto max-w-md rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-md shadow-2xl">
            <div className="relative h-64 sm:h-72 w-full overflow-hidden rounded-xl">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80"
                alt="Fresh produce supermarket aisle"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Fresh Harvest Daily</p>
                  <p className="text-sm font-bold">Farm-Checked Quality Guarantee</p>
                </div>
                <span className="rounded-lg bg-emerald-500/90 px-2.5 py-1 text-xs font-extrabold text-slate-950">
                  Lagos Metro
                </span>
              </div>
            </div>

            {/* Quick-buy snapshot strip */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { name: "Farm Eggs", img: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=300&q=80", price: "₦5,200", link: "/categories/eggs" },
                { name: "Long Grain Rice", img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80", price: "₦14,500", link: "/categories/rice" },
                { name: "Fresh Chicken", img: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=300&q=80", price: "₦6,800", link: "/categories/chicken" },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.link}
                  className="group flex flex-col items-center rounded-lg bg-white/10 p-2 text-center transition-colors hover:bg-white/20"
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    className="h-12 w-12 rounded-md object-cover transition-transform group-hover:scale-105"
                  />
                  <span className="mt-1.5 text-[11px] font-medium text-slate-200 truncate w-full">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">{item.price}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ValueProps() {
  const items = [
    {
      icon: Truck,
      title: "Same-Day Delivery",
      text: "Convenient morning & evening delivery slots across all Lagos zones.",
    },
    {
      icon: ShieldCheck,
      title: "100% Quality Checked",
      text: "Hand-graded fruits, vegetables, and butcher meats or full refund.",
    },
    {
      icon: Percent,
      title: "Direct Wholesale Rates",
      text: "No middleman markup — transparent pricing with seasonal deals.",
    },
    {
      icon: Sparkles,
      title: "Secure Checkout",
      text: "Pay with Cards, Bank Transfer, USSD, or Pay on Delivery.",
    },
  ]

  return (
    <section className="border-b border-slate-200 bg-white py-8">
      <div className="container grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div
            key={it.title}
            className="flex items-start gap-3.5 rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:bg-slate-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <it.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{it.title}</p>
              <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{it.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function DealStrip() {
  return (
    <section className="container py-10">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600">
              Limited Time Deals
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">Today's Best Supermarket Deals</h2>
          <p className="mt-1 text-sm text-slate-500">Save big on staple groceries before stock runs out.</p>
        </div>
        <Link
          to="/deals"
          className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-800"
        >
          View all deals <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {deals.map((p) => {
          const discount = discountPercent(p.price, p.compareAtPrice)
          return (
            <Link
              key={p.id}
              to={`/products/${p.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-xs transition-all hover:-translate-y-1 hover:border-emerald-400 hover:shadow-md"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-50">
                <ProductImage
                  productName={p.name}
                  categoryName={p.categoryName}
                  imageUrl={p.imageUrl}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  size="md"
                />
                {discount && (
                  <span className="absolute left-2 top-2 rounded-md bg-rose-600 px-2 py-0.5 text-[11px] font-extrabold text-white">
                    {discount}% OFF
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-1 flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                  {p.brand}
                </span>
                <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-emerald-700">
                  {p.name}
                </p>
                <span className="text-xs text-slate-500 mt-0.5">{p.unit}</span>

                <div className="mt-auto pt-2 flex items-baseline gap-2">
                  <span className="text-base font-extrabold text-slate-900">
                    {formatNaira(p.price)}
                  </span>
                  {p.compareAtPrice && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatNaira(p.compareAtPrice)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function CategoryGrid() {
  return (
    <section className="bg-slate-50/70 border-y border-slate-200/80 py-12">
      <div className="container">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Shop By Department</h2>
            <p className="mt-1 text-sm text-slate-600">Fresh farm harvest, dry pantry, butchery, dairy &amp; home essentials.</p>
          </div>
          <Link
            to="/categories"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-800"
          >
            All 22 categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {categories.slice(0, 16).map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PopularStrip() {
  return (
    <section className="container py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <TrendingUp className="h-4 w-4" />
            <span>Top Picks</span>
          </div>
          <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">Popular In Lagos This Week</h2>
          <p className="mt-1 text-sm text-slate-500">Most ordered groceries by local households and families.</p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-800"
        >
          Full supermarket <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <ProductGrid products={featuredProducts.slice(0, 10)} />
    </section>
  )
}

function SupermarketPromoBanner() {
  return (
    <section className="container py-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 p-8 text-white shadow-lg sm:p-10">
        <div className="relative z-10 max-w-xl">
          <span className="inline-block rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
            New Customer Special
          </span>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl text-white">
            Get ₦500 Off Your First Grocery Order
          </h2>
          <p className="mt-2 text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            Stock your kitchen today with fresh Nigerian staples. Apply code{" "}
            <span className="font-mono font-bold text-amber-300 bg-emerald-950/60 px-2 py-0.5 rounded">FRESH500</span>{" "}
            at checkout on orders above ₦5,000.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-emerald-900 shadow-md hover:bg-slate-100 transition-colors"
            >
              Start Shopping Now <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-xs text-emerald-200">
              Free delivery on orders over ₦50,000
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export function HomePage() {
  return (
    <div className="pb-10">
      <Hero />
      <ValueProps />
      <DealStrip />
      <CategoryGrid />
      <SupermarketPromoBanner />
      <PopularStrip />
    </div>
  )
}
