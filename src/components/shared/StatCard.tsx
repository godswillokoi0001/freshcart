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
}

const accentMap = {
  fresh: "bg-fresh-50 text-fresh-600",
  navy: "bg-navy-100 text-navy-600",
  warning: "bg-warning-50 text-warning-600",
  danger: "bg-danger-50 text-danger-600",
  info: "bg-sky-50 text-sky-600",
  success: "bg-success-50 text-success-600",
}

export function StatCard({ label, value, icon: Icon, trend, hint, accent = "fresh", onClick }: StatCardProps) {
  const Wrapper = onClick ? "button" : "div"
  return (
    <Wrapper
      className={cn(
        "flex items-start justify-between rounded-lg border border-navy-200 bg-white p-5 text-left shadow-sm",
        onClick && "transition-shadow hover:shadow-md w-full"
      )}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      <div>
        <p className="text-sm font-medium text-navy-500">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-navy-900">{value}</p>
        {trend && (
          <p className={cn("mt-1 text-xs font-medium", trend.positive ? "text-success-600" : "text-danger-600")}>
            {trend.positive ? "↑" : "↓"} {trend.value}
            {hint && <span className="ml-1 font-normal text-navy-400">{hint}</span>}
          </p>
        )}
        {hint && !trend && <p className="mt-1 text-xs text-navy-400">{hint}</p>}
      </div>
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", accentMap[accent])}>
        <Icon className="h-5 w-5" />
      </span>
    </Wrapper>
  )
}
