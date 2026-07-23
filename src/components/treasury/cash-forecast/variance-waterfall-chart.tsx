"use client"

import { cn } from "@/lib/utils"
import { MOCK_FORECASTS } from "./data"

const MAX_HEIGHT = 200

function formatCash(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

function shortenLabel(cat: string): string {
  const map: Record<string, string> = {
    operating: "Operating",
    investing: "Investing",
    financing: "Financing",
    fx: "FX",
    tax: "Tax",
  }
  return map[cat] ?? cat
}

export function VarianceWaterfallChart({ className }: { className?: string }) {
  const records = MOCK_FORECASTS.filter((f) => f.horizon === "monthly").slice(0, 1)
  const base = records[0]
  if (!base) return null

  const categories = [
    { label: "Opening Cash", value: base.openingCash, isTotal: true },
    { label: "Inflows", value: base.inflows, positive: true },
    { label: "Outflows", value: base.outflows, positive: false },
    { label: "Operating", value: base.operatingCash, positive: base.operatingCash >= 0 },
    { label: "Investing", value: base.investingCash, positive: base.investingCash >= 0 },
    { label: "Financing", value: base.financingCash, positive: base.financingCash >= 0 },
    { label: "FX Impact", value: base.fxImpact, positive: base.fxImpact >= 0 },
    { label: "Taxes", value: -base.taxes, positive: false },
    { label: "Closing Cash", value: base.endingCash, isTotal: true },
  ]

  const allAbs = categories.map((c) => Math.abs(c.value))
  const maxAbs = Math.max(...allAbs, 1)

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Cash Waterfall</h3>
      <p className="mt-0.5 text-xs text-zinc-400">Opening → adjustments → closing</p>
      <div className="mt-4" dir="ltr" aria-label="Cash waterfall chart">
        <div className="flex items-end gap-1.5" style={{ height: MAX_HEIGHT }}>
          {categories.map((cat, i) => {
            const absVal = Math.abs(cat.value)
            const pct = (absVal / maxAbs) * 100
            const barH = Math.max((pct / 100) * MAX_HEIGHT, 4)
            const bgColor = cat.isTotal
              ? "bg-zinc-400"
              : cat.positive
                ? "bg-emerald-500/80"
                : "bg-red-500/80"
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[9px] text-zinc-400">
                  {cat.isTotal ? formatCash(cat.value) : `${cat.positive ? "+" : "-"}${formatCash(absVal)}`}
                </span>
                <div
                  className={`w-full rounded-sm ${bgColor}`}
                  style={{ height: barH }}
                  role="img"
                  aria-label={`${cat.label}: ${formatCash(cat.value)}`}
                />
                <span className="text-[9px] text-zinc-600 text-center leading-tight">
                  {cat.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}