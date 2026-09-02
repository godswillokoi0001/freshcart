import type { Address } from "@app-types/index"
import { MapPin, Pencil, Trash2, Check } from "lucide-react"
import { Button } from "@components/ui/Button"
import { cn } from "@lib/utils"

export function AddressCard({
  address,
  selected,
  onSelect,
  onEdit,
  onDelete,
  className,
}: {
  address: Address
  selected?: boolean
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}) {
  return (
    <div
      role={onSelect ? "radio" : undefined}
      aria-checked={onSelect ? selected : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (onSelect && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        "rounded-lg border bg-white p-4 transition-colors",
        selected ? "border-fresh-600 ring-1 ring-fresh-600" : "border-navy-200 hover:border-navy-300",
        onSelect && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className={cn("mt-0.5 flex h-9 w-9 items-center justify-center rounded-full", selected ? "bg-fresh-50 text-fresh-700" : "bg-navy-50 text-navy-500")}>
            <MapPin className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-navy-900">{address.label}</p>
              {address.isDefault && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-fresh-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fresh-700">
                  <Check className="h-3 w-3" /> Default
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-navy-700">{address.fullName} · {address.phone}</p>
            <p className="mt-0.5 text-sm text-navy-500">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
              <br />
              {address.city}, {address.state}
            </p>
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex shrink-0 gap-1">
            {onEdit && (
              <Button variant="ghost" size="icon" aria-label="Edit address" onClick={(e) => { e.stopPropagation(); onEdit() }}>
                <Pencil className="h-4 w-4 text-navy-500" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" aria-label="Delete address" onClick={(e) => { e.stopPropagation(); onDelete() }}>
                <Trash2 className="h-4 w-4 text-danger-500" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
