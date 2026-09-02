import { ShoppingCart } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@lib/utils"

export function Logo({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-fresh-600 text-white">
        <ShoppingCart className="h-5 w-5" />
      </span>
      <span className={cn("font-heading text-xl font-bold tracking-tight", dark ? "text-white" : "text-navy-900")}>
        Fresh<span className="text-fresh-600">Cart</span>
      </span>
    </Link>
  )
}
