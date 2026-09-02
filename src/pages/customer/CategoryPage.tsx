import { Link, useParams } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { CategoryBanner } from "@components/customer/CategoryCard"
import { ProductGrid } from "@components/customer/ProductCard"
import { EmptyState } from "@components/ui/EmptyState"
import { categories } from "@data/categories"
import { products } from "@data/products"

export function CategoryPage() {
  const { category } = useParams()
  const cat = categories.find((c) => c.slug === category)
  const list = products.filter((p) => p.categoryId === cat?.id)

  if (!cat) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={ChevronRight}
          title="Category not found"
          description="The category you're looking for doesn't exist or may have been renamed."
          action={{ label: "Browse all categories", href: "/categories" }}
        />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <nav className="mb-6 flex items-center gap-1 text-sm text-navy-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-fresh-700">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/categories" className="hover:text-fresh-700">Categories</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-navy-900">{cat.name}</span>
      </nav>
      <CategoryBanner category={cat} />
      <div className="mt-8">
        {list.length === 0 ? (
          <EmptyState
            icon={ChevronRight}
            title={`Nothing in ${cat.name} yet.`}
            description="We're restocking this aisle. Check back soon."
            action={{ label: "Shop all products", href: "/shop" }}
          />
        ) : (
          <ProductGrid products={list} />
        )}
      </div>
    </div>
  )
}
