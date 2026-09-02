import { Check, Circle } from "lucide-react"
import type { OrderTimelineEvent } from "@app-types/index"
import { formatDateTime } from "@lib/format"
import { cn } from "@lib/utils"

export function OrderTimeline({ events, className }: { events: OrderTimelineEvent[]; className?: string }) {
  const lastCompletedIndex = (() => {
    let idx = -1
    events.forEach((e, i) => {
      if (e.completed) idx = i
    })
    return idx
  })()

  return (
    <ol className={cn("relative", className)}>
      {events.map((e, i) => {
        const last = i === events.length - 1
        const lineColor = i < lastCompletedIndex ? "bg-fresh-600" : i === lastCompletedIndex ? "bg-fresh-600/40" : "bg-navy-200"
        return (
          <li key={e.label} className="relative flex gap-4 pb-7 last:pb-0">
            {!last && (
              <span
                aria-hidden
                className={cn("absolute left-[13px] top-8 h-[calc(100%-2rem)] w-0.5", lineClass(e, events[i + 1]))}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
                e.completed
                  ? "bg-fresh-600 text-white"
                  : e.current
                    ? "border-2 border-fresh-600 bg-white"
                    : "border-2 border-navy-200 bg-white"
              )}
            >
              {e.completed ? (
                <Check className="h-4 w-4" />
              ) : (
                <Circle className="h-2.5 w-2.5 text-navy-300" />
              )}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={cn("text-sm font-semibold", e.completed || e.current ? "text-navy-900" : "text-navy-400")}>
                {e.label}
                {e.current && !e.completed && (
                  <span className="ml-2 rounded-full bg-fresh-50 px-2 py-0.5 text-xs font-medium text-fresh-700">In progress</span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-navy-500">{formatDateTime(e.timestamp)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function lineClass(event: OrderTimelineEvent, next?: OrderTimelineEvent): string {
  if (event.completed && next?.completed) return "bg-fresh-600"
  if (event.completed && next && next.current) return "bg-fresh-600/40"
  return "bg-navy-200"
}
