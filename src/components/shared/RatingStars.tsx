import { Star } from "lucide-react"
import { cn } from "@lib/utils"

export function RatingStars({ rating, className, showValue = false, count }: { rating: number; className?: string; showValue?: boolean; count?: number }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-navy-200 text-navy-200"
            )}
          />
        ))}
      </div>
      {showValue && <span className="text-xs font-medium text-navy-700">{rating.toFixed(1)}</span>}
      {count !== undefined && <span className="text-xs text-navy-400">({count})</span>}
    </div>
  )
}
