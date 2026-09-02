import * as React from "react"
import { useSearchParams } from "react-router-dom"
import { Search, SlidersHorizontal, X, PackageSearch } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Checkbox } from "@components/ui/Checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@components/ui/Sheet"
import { EmptyState } from "@components/ui/EmptyState"
import { ProductGrid } from "@components/customer/ProductCard"
import { products } from "@data/products"
import { brands, categories } from "@data/categories"
import { formatNaira } from "@lib/format"
import { cn } from "@lib/utils"

const PAGE_SIZE = 20

type SortOption = "popular" | "price-asc" | "price-desc" | "name" | "discount"

export function ShopPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get("q") ?? ""
  const categoryFilter = params.getAll("category")
  const brandFilter = params.getAll("brand")
  const availability = params.get("availability") ?? "all"
  const maxPrice = Number(params.get("maxPrice") ?? 100000)
  const sort = (params.get("sort") as SortOption) ?? "popular"
  const [visible, setVisible] = React.useState(PAGE_SIZE)
  const [searchInput, setSearchInput] = React.useState(query)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const update = (fn: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params)
    fn(next)
    setVisible(PAGE_SIZE)
    setParams(next, { replace: true })
  }

  React.useEffect(() => setSearchInput(query), [query])

  const filtered = React.useMemo(() => {
    let list = [...products]
    if (query) {
      const q = query.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      )
    }
    if (categoryFilter.length) list = list.filter((p) => categoryFilter.includes(p.categoryId))
    if (brandFilter.length) list = list.filter((p) => brandFilter.includes(p.brand))
    if (maxPrice < 100000) list = list.filter((p) => p.price <= maxPrice)
    if (availability === "in-stock") list = list.filter((p) => p.stockStatus === "IN_STOCK" || p.stockStatus === "LOW_STOCK")
    if (availability === "on-sale") list = list.filter((p) => p.compareAtPrice)

    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break
      case "price-desc": list.sort((a, b) => b.price - a.price); break
      case "name": list.sort((a, b) => a.name.localeCompare(b.name)); break
      case "popular": list.sort((a, b) => b.reviewCount - a.reviewCount); break
    }
    return list
  }, [query, categoryFilter, brandFilter, availability, maxPrice, sort])

  const activeFilterCount =
    categoryFilter.length + brandFilter.length + (availability !== "all" ? 1 : 0) + (maxPrice < 100000 ? 1 : 0)

  const toggleArrayParam = (key: string, value: string) => {
    update((p) => {
      const current = p.getAll(key)
      p.delete(key)
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
      next.forEach((v) => p.append(key, v))
    })
  }

  const filtersPanel = (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-navy-900">Category</p>
        <div className="mt-2 space-y-2">
          {categories.map((c) => (
            <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm text-navy-600">
              <Checkbox
                checked={categoryFilter.includes(c.id)}
                onCheckedChange={() => toggleArrayParam("category", c.id)}
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-navy-900">Brand</p>
        <div className="mt-2 max-h-56 space-y-2 overflow-y-auto pr-1">
          {brands.map((b) => (
            <label key={b.id} className="flex cursor-pointer items-center gap-2 text-sm text-navy-600">
              <Checkbox
                checked={brandFilter.includes(b.name)}
                onCheckedChange={() => toggleArrayParam("brand", b.name)}
              />
              {b.name}
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-navy-900">Max price: {formatNaira(maxPrice)}</p>
        <input
          type="range"
          min={500}
          max={100000}
          step={500}
          value={maxPrice}
          onChange={(e) => update((p) => p.set("maxPrice", e.target.value))}
          className="mt-2 w-full accent-fresh-600"
          aria-label="Maximum price"
        />
      </div>
      <div>
        <p className="text-sm font-semibold text-navy-900">Availability</p>
        <div className="mt-2 space-y-2">
          {[
            { value: "all", label: "All products" },
            { value: "in-stock", label: "In stock only" },
            { value: "on-sale", label: "On sale" },
          ].map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm text-navy-600">
              <input
                type="radio"
                name="availability"
                checked={availability === opt.value}
                onChange={() => update((p) => p.set("availability", opt.value))}
                className="accent-fresh-600"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            setParams(new URLSearchParams(query ? { q: query } : {}), { replace: true })
            setVisible(PAGE_SIZE)
          }}
        >
          <X className="h-4 w-4" /> Clear all filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">
          {query ? `Results for "${query}"` : "Shop All Products"}
        </h1>
        <p className="mt-1 text-sm text-navy-500">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""} available
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") update((p) => (searchInput ? p.set("q", searchInput) : p.delete("q")))
            }}
            placeholder="Search products…"
            className="h-10 w-full rounded-md border border-navy-200 pl-9 pr-3 text-sm focus:border-fresh-500 focus:outline-none focus:ring-1 focus:ring-fresh-500"
            aria-label="Search products"
          />
        </div>

        <Select value={sort} onValueChange={(v) => update((p) => p.set("sort", v))}>
          <SelectTrigger className="w-44" aria-label="Sort products">
            <span className="text-navy-500">Sort:</span>
            {({ popular: "Most popular", "price-asc": "Price: Low to High", "price-desc": "Price: High to Low", name: "Name A–Z" } as Record<SortOption, string>)[sort]}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most popular</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name">Name A–Z</SelectItem>
          </SelectContent>
        </Select>

        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-fresh-600 px-1 text-xs font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto p-0">
            <SheetHeader className="border-b border-navy-100 p-4 text-left">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="p-4">
              {filtersPanel}
              <SheetClose asChild>
                <Button className="mt-6 w-full">Show {filtered.length} results</Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">{filtersPanel}</div>
        </aside>

        <div className="min-w-0 flex-1">
          {filtered.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="We couldn't find products matching your search."
              description="Try a different keyword, or clear some filters to see more products."
              action={{ label: "Clear filters", href: "/shop" }}
            />
          ) : (
            <>
              <ProductGrid products={filtered.slice(0, visible)} />
              {visible < filtered.length && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline" size="lg" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                    Load more ({filtered.length - visible} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
