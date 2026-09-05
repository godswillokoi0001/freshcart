import * as React from "react"
import { ShoppingBag, Package } from "lucide-react"
import { categoryVisual } from "@lib/catalog"
import { cn } from "@lib/utils"

interface ProductImageProps {
  productName: string
  categoryName?: string
  imageUrl?: string
  alt?: string
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export function ProductImage({ productName, categoryName = "Groceries", imageUrl, alt, className, size = "md" }: ProductImageProps) {
  const visual = categoryVisual(categoryName)
  const [imgError, setImgError] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    setImgError(false)
    setLoaded(false)
  }, [imageUrl])

  const initials = productName
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }

  const showImage = Boolean(imageUrl) && !imgError

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-slate-50 transition-colors",
        className
      )}
      style={{ backgroundColor: visual.tint }}
    >
      {showImage ? (
        <>
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-slate-200/60" />
          )}
          <img
            src={imageUrl}
            alt={alt ?? productName}
            className={cn(
              "h-full w-full object-cover transition-all duration-300",
              loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            )}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setImgError(true)}
          />
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center p-3 select-none text-center">
          <div
            className="flex items-center justify-center rounded-full p-2.5 shadow-xs"
            style={{ backgroundColor: `${visual.accent}20`, color: visual.accent }}
          >
            {size === "sm" ? (
              <ShoppingBag className={iconSizes[size]} />
            ) : (
              <Package className={iconSizes[size]} />
            )}
          </div>
          {size !== "sm" && (
            <span
              className="mt-2 text-[11px] font-bold tracking-wider uppercase text-slate-700 max-w-[90%] truncate"
            >
              {initials || categoryName}
            </span>
          )}
          <span className="text-[9px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">
            {categoryName}
          </span>
        </div>
      )}
    </div>
  )
}

