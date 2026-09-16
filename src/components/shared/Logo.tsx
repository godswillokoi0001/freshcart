import { Link } from "react-router-dom"
import { cn } from "@lib/utils"

/**
 * FreshCart wordmark — no icon block.
 * "Fresh" in Fraunces italic (the display face), "Cart" in DM Sans weight 700.
 * The contrast between the warm serif and the clean grotesque IS the identity.
 */
export function Logo({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <Link to="/" className={cn("inline-flex items-baseline gap-0 leading-none", className)}>
      <span
        className={cn(
          "font-display italic font-bold text-[1.375rem] tracking-tight leading-none",
          dark ? "text-fc-cream" : "text-fc-earth"
        )}
        style={{ fontOpticalSizing: "auto" } as React.CSSProperties}
      >
        Fresh
      </span>
      <span
        className={cn(
          "font-sans font-bold text-[1.375rem] tracking-tight leading-none",
          "text-fc-market"
        )}
      >
        Cart
      </span>
    </Link>
  )
}
