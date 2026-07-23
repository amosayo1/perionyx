"use client"

import { cn } from "@/lib/utils"
import { MOCK_TREND_DATA } from "./data"

const MAX_HEIGHT = 200

function formatCash(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

export function LiquidityTrendChart({ className }: { className?: string }) {
  const data = MOCK_TREND_DATA.liquidityTrend
  const maxVal = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Liquidity Trend</h3>
      <p className="mt-0.5 text-xs text-zinc-400">Liquidity coverage ratio</p>
      <div className="mt-4" dir="ltr" aria-label="Liquidity trend chart">
        <div className="flex items-end gap-1.5" style={{ height: MAX_HEIGHT }}>
          {data.map((point, i) => {
            const pct = (point.value / maxVal) * 100
            const barH = Math.max((pct / 100) * MAX_HEIGHT, 4)
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-amber-400">
                  {point.value.toFixed(1)}x
                </span>
                <div
                  className="w-full rounded-sm bg-gradient-to-t from-yellow-600 to-amber-500"
                  style={{ height: barH }}
                  role="img"
                  aria-label={`${point.label}: ${point.value}x`}
                />
                <span className="text-[10px] text-zinc-600">{point.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}