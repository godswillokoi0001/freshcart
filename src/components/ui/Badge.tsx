import * as React from "react"
import { cn } from "@lib/utils"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          "bg-navy-100 text-navy-700": variant === "default",
          "bg-navy-200 text-navy-800": variant === "secondary",
          "bg-danger-50 text-danger-600": variant === "destructive",
          "border border-navy-300 bg-transparent": variant === "outline",
          "bg-success-50 text-success-600": variant === "success",
          "bg-warning-50 text-warning-600": variant === "warning",
          "bg-fresh-50 text-fresh-600": variant === "info",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
