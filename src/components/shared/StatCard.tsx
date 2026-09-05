import { type LucideIcon } from "lucide-react"
import { cn } from "@lib/utils"

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  trend?: { value: string; positive: boolean }
  hint?: string
  accent?: "fresh" | "navy" | "warning" | "danger" | "info" | "success"
  onClick?: () => void
  className?: string
  dark?: boolean
}

const accentMap = {
  fresh: "bg-fresh-50 text-fresh-600",
  navy: "bg-navy-100 text-navy-600",
  warning: "bg-warning-50 text-warning-600",
  danger: "bg-danger-50 text-danger-600",
  info: "bg-sky-50 text-sky-600",
  success: "bg-success-50 text-success-600",
}

const darkAccentMap = {
  fresh: "bg-fresh-950/60 text-fresh-400 border border-fresh-800/40",
  navy: "bg-navy-800 text-navy-200 border border-navy-700",
  warning: "bg-warning-950/60 text-warning-400 border border-warning-800/40",
  danger: "bg-danger-950/60 text-danger-400 border border-danger-800/40",
  info: "bg-sky-950/60 text-sky-400 border border-sky-800/40",
  success: "bg-success-950/60 text-success-400 border border-success-800/40",
}

export function StatCard({ label, value, icon: Icon, trend, hint, accent = "fresh", onClick, className, dark }: StatCardProps) {
  const Wrapper = onClick ? "button" : "div"
  return (
    <Wrapper
      className={cn(
        "flex items-start justify-between rounded-lg border p-4 sm:p-5 text-left shadow-sm transition-all min-w-0",
        dark ? "border-navy-800 bg-navy-900 text-white" : "border-navy-200 bg-white text-navy-900",
        onClick && "hover:shadow-md hover:border-navy-300 w-full",
        className
      )}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      <div className="min-w-0 flex-1 pr-2">
        <p className={cn("text-xs sm:text-sm font-medium truncate", dark ? "text-navy-400" : "text-navy-500")}>{label}</p>
        <p className={cn("mt-1 text-xl sm:text-2xl font-bold tracking-tight truncate", dark ? "text-white" : "text-navy-900")}>{value}</p>
        {trend && (
          <p className={cn("mt-1 text-xs font-medium truncate", trend.positive ? "text-success-500" : "text-danger-500")}>
            {trend.positive ? "↑" : "↓"} {trend.value}
            {hint && <span className={cn("ml-1 font-normal", dark ? "text-navy-500" : "text-navy-400")}>{hint}</span>}
          </p>
        )}
        {hint && !trend && <p className={cn("mt-1 text-xs truncate", dark ? "text-navy-500" : "text-navy-400")}>{hint}</p>}
      </div>
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", dark ? darkAccentMap[accent] : accentMap[accent])}>
        <Icon className="h-5 w-5" />
      </span>
    </Wrapper>
  )
}
