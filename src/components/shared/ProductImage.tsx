import { categoryVisual } from "@lib/catalog"
import { cn } from "@lib/utils"

interface ProductImageProps {
  productName: string
  categoryName: string
  imageUrl?: string
  alt?: string
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeMap = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-6xl",
  xl: "text-7xl",
}

/**
 * Renders a real product photo when `imageUrl` is available,
 * otherwise a clean category-tinted placeholder so the catalogue
 * never shows broken images. The backend can supply real photos later
 * by populating imageUrl — no component changes needed.
 */
export function ProductImage({ productName, categoryName, imageUrl, alt, className, size = "md" }: ProductImageProps) {
  const visual = categoryVisual(categoryName)
  const initials = productName
    .replace(/[^a-zA-Z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden rounded-md", className)}
      style={{ backgroundColor: visual.tint }}
      aria-hidden={!alt}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={alt ?? productName} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center select-none">
          <span className={cn("leading-none", size === "sm" ? "text-2xl" : size === "md" ? "text-4xl" : size === "lg" ? "text-5xl" : "text-6xl")}>
            {visual.emoji}
          </span>
          <span
            className="mt-1 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: visual.accent }}
          >
            {size !== "sm" ? initials : ""}
          </span>
        </div>
      )}
    </div>
  )
}
