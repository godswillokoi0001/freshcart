import { Link } from "react-router-dom"
import { ArrowRight, Truck, ShieldCheck, Clock, BadgePercent } from "lucide-react"
import { Button } from "@components/ui/Button"
import { ProductGrid } from "@components/customer/ProductCard"
import { CategoryCard } from "@components/customer/CategoryCard"
import { categories } from "@data/categories"
import { products, dealProducts, featuredProducts } from "@data/products"
import { discountPercent } from "@lib/format"
import { categoryVisual } from "@lib/catalog"

const deals = dealProducts.slice(0, 5)

function Hero() {
  return (
    <section className="border-b border-navy-200 bg-navy-50">
      <div className="container grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-fresh-100 px-3 py-1 text-xs font-semibold text-fresh-800">
            <Clock /> Same-day delivery in Lagos
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl">
            Everything You Need, <span className="text-fresh-600">Delivered Fresh.</span>
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-navy-600 sm:text-lg">
            Shop groceries, household essentials and everyday products from FreshCart —
            your neighbourhood supermarket, now online.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/shop">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/deals">See Today's Deals</Link>
            </Button>
          </div>
          <dl className="mt-8 grid max-w-md grid-cols-3 gap-4">
            {[
              { label: "Products", value: "5,000+" },
              { label: "Delivery slots", value: "Daily" },
              { label: "Happy shoppers", value: "25k+" },
            ].map((s) => (
              <div key={s.label}>
                <dd className="text-xl font-bold text-navy-900">{s.value}</dd>
                <dt className="text-xs text-navy-500">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative hidden lg:block">
          <div className="grid grid-cols-3 gap-3">
            {categories.slice(0, 9).map((c, i) => {
              const visual = categoryVisual(c.name)
              return (
                <Link
                  key={c.id}
                  to={`/categories/${c.slug}`}
                  className="flex aspect-square items-center justify-center rounded-xl border border-navy-200 bg-white transition-transform hover:-translate-y-1 hover:shadow-md"
                  style={{ boxShadow: `0 1px 2px rgb(16 24 40 / 0.06)` }}
                  aria-label={`Shop ${c.name}`}
                >
                  <div className="text-center">
                    <span className="text-3xl">{visual.emoji}</span>
                    <p className="mt-1 text-xs font-medium text-navy-600">{c.name}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function ValueProps() {
  const items = [
    { icon: Truck, title: "Fast delivery", text: "Same-day slots across Lagos, 7 days a week." },
    { icon: ShieldCheck, title: "Freshness guaranteed", text: "Quality-checked produce or your money back." },
    { icon: BadgePercent, title: "Real prices", text: "Transparent naira pricing with weekly deals." },
  ]
  return (
    <section className="container grid gap-4 py-10 sm:grid-cols-3">
      {items.map((it) => (
        <div key={it.title} className="flex gap-3 rounded-lg border border-navy-200 bg-white p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-fresh-50 text-fresh-700">
            <it.icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-navy-900">{it.title}</p>
            <p className="mt-0.5 text-sm text-navy-500">{it.text}</p>
          </div>
        </div>
      ))}
    </section>
  )
}

function DealStrip() {
  return (
    <section className="container pb-12">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Today's Deals</h2>
          <p className="mt-1 text-sm text-navy-500">Save big on pantry staples — while stocks last.</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/deals">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {deals.map((p) => {
          const discount = discountPercent(p.price, p.compareAtPrice)
          return (
            <Link
              key={p.id}
              to={`/products/${p.slug}`}
              className="group rounded-lg border border-navy-200 bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-fresh-700">
                  {discount}% <span className="text-xs font-semibold">OFF</span>
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-medium text-navy-900 group-hover:text-fresh-700">{p.name}</p>
              <p className="text-xs text-navy-500">{p.unit}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-base font-bold text-navy-900">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(p.price)}</span>
                {p.compareAtPrice && <span className="text-xs text-navy-400 line-through">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(p.compareAtPrice)}</span>}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export function HomePage() {
  return (
    <div className="pb-4">
      <Hero />
      <ValueProps />

      <section className="container pb-12">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-navy-900">Shop by Category</h2>
            <p className="mt-1 text-sm text-navy-500">From rice to fresh produce — find it all in one supermarket.</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/categories">
              All categories <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {categories.slice(0, 16).map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </section>

      <DealStrip />

      <section className="container pb-12">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-navy-900">Popular Right Now</h2>
            <p className="mt-1 text-sm text-navy-500">What Lagos households are buying this week.</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/shop">
              Shop all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <ProductGrid products={featuredProducts} />
      </section>

      <section className="border-t border-navy-200 bg-navy-900">
        <div className="container flex flex-col items-center justify-between gap-6 py-12 sm:flex-row">
          <div>
            <h2 className="text-2xl font-bold text-white">Get ₦500 off your first order</h2>
            <p className="mt-1 text-sm text-navy-300">
              Use coupon <span className="font-semibold text-fresh-400">FRESH500</span> on orders above ₦5,000.
            </p>
          </div>
          <Button size="lg" asChild>
            <Link to="/shop">Start Shopping</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
