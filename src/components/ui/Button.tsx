import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    React.RefAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fresh-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-fresh-600 text-white hover:bg-fresh-700": variant === "default",
            "bg-danger-500 text-white hover:bg-danger-600": variant === "destructive",
            "border border-navy-300 bg-transparent hover:bg-navy-50": variant === "outline",
            "bg-navy-100 text-navy-900 hover:bg-navy-200": variant === "secondary",
            "bg-transparent hover:bg-navy-100": variant === "ghost",
            "text-fresh-600 underline-offset-4 hover:underline": variant === "link",
            "h-11 sm:h-10 px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[40px]": size === "default",
            "h-9 rounded-md px-3 text-xs": size === "sm",
            "h-12 sm:h-11 rounded-md px-6 sm:px-8 min-h-[48px] sm:min-h-[44px]": size === "lg",
            "h-11 w-11 sm:h-10 sm:w-10 min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px]": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
