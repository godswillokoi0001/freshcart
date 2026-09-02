import type { Review } from "@app-types/index"
import { RatingStars } from "@components/shared/RatingStars"
import { Avatar, AvatarFallback } from "@components/ui/Avatar"
import { BadgeCheck } from "lucide-react"
import { formatDate } from "@lib/format"

export function ReviewCard({ review }: { review: Review }) {
  const initials = review.customerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
  return (
    <div className="border-b border-navy-100 py-5 last:border-b-0">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-fresh-50 text-xs font-semibold text-fresh-700">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-navy-900">{review.customerName}</p>
            {review.verifiedPurchase && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-fresh-700">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified purchase
              </span>
            )}
          </div>
          <RatingStars rating={review.rating} className="mt-0.5" />
        </div>
        <p className="ml-auto text-xs text-navy-400">{formatDate(review.date)}</p>
      </div>
      <p className="mt-3 text-sm font-semibold text-navy-900">{review.title}</p>
      <p className="mt-1 text-sm leading-relaxed text-navy-600">{review.comment}</p>
      <p className="mt-2 text-xs text-navy-400">{review.helpfulCount} people found this helpful</p>
    </div>
  )
}
