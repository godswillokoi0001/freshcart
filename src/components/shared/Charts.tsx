import * as React from "react"
import { cn } from "@lib/utils"

/* ---------- Line chart (SVG, dependency-free) ---------- */
interface LineChartProps {
  data: { label: string; value: number }[]
  height?: number
  className?: string
  valueFormat?: (v: number) => string
  stroke?: string
}

export function LineChart({ data, className, stroke = "#16a34a", height = 220 }: LineChartProps) {
  const [hover, setHover] = React.useState<number | null>(null)
  const width = 100
  const max = Math.max(...data.map((d) => d.value))
  const min = Math.min(...data.map((d) => d.value))
  const range = max - min || 1
  const pad = 8

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2)
    const y = 100 - pad - ((d.value - min) / range) * (100 - pad * 2)
    return { x, y, ...d }
  })

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")
  const areaPath = `${path} L${points[points.length - 1].x},100 L${points[0].x},100 Z`

  return (
    <div className={cn("relative", className)}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height }} role="img" aria-label="Trend chart">
        {[25, 50, 75].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e2e8f0" strokeWidth="0.25" />
        ))}
        <path d={areaPath} fill={stroke} opacity="0.08" />
        <path d={path} fill="none" stroke={stroke} strokeWidth="1" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null && (
          <>
            <line x1={points[hover].x} y1="0" x2={points[hover].x} y2="100" stroke="#94a3b8" strokeWidth="0.25" strokeDasharray="2 2" />
            <circle cx={points[hover].x} cy={points[hover].y} r="1.5" fill={stroke} stroke="white" strokeWidth="0.5" />
          </>
        )}
      </svg>
      <div className="absolute inset-0 flex">
        {data.map((_, i) => (
          <div key={i} className="h-full flex-1" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
        ))}
      </div>
      {hover !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-navy-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
          style={{ left: `${points[hover].x}%`, top: 0 }}
        >
          <div className="font-semibold">{data[hover].label}</div>
          <div className="text-navy-300">{data[hover].value.toLocaleString()}</div>
        </div>
      )}
    </div>
  )
}

/* ---------- Bar chart ---------- */
interface BarChartProps {
  data: { label: string; value: number }[]
  className?: string
  height?: number
  color?: string
  valueFormat?: (v: number) => string
  horizontal?: boolean
}

export function BarChart({ data, className, height = 220, color = "#16a34a", horizontal = false }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value))
  if (horizontal) {
    return (
      <div className={cn("space-y-3", className)}>
        {data.map((d) => (
          <div key={d.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-navy-700">{d.label}</span>
              <span className="text-navy-500">{d.value.toLocaleString()}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-navy-100">
              <div className="h-full rounded-full transition-all" style={{ width: `${(d.value / max) * 100}%`, backgroundColor: color }} />
            </div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className={cn("flex items-end gap-1.5", className)} style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="group relative flex h-full flex-1 flex-col justify-end">
          <div className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-navy-900 px-2 py-1 text-xs text-white group-hover:block">
            {d.label}: {d.value.toLocaleString()}
          </div>
          <div
            className="w-full rounded-t-sm transition-all group-hover:opacity-80"
            style={{ height: `${Math.max(4, (d.value / max) * 100)}%`, backgroundColor: color }}
          />
        </div>
      ))}
    </div>
  )
}

/* ---------- Donut chart ---------- */
interface DonutChartProps {
  data: { label: string; value: number; color: string }[]
  className?: string
  size?: number
}

export function DonutChart({ data, className, size = 180 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0)
  let offset = 0
  const radius = 15.9155

  return (
    <div className={cn("flex items-center gap-6", className)}>
      <svg viewBox="0 0 42 42" width={size} height={size} className="shrink-0 -rotate-90" role="img" aria-label="Distribution chart">
        <circle cx="21" cy="21" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="6" />
        {data.map((d) => {
          const pct = (d.value / total) * 100
          const el = (
            <circle
              key={d.label}
              cx="21"
              cy="21"
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth="6"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          )
          offset += pct
          return el
        })}
      </svg>
      <ul className="space-y-2">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-navy-700">{d.label}</span>
            <span className="ml-auto font-medium text-navy-900">{d.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
