"use client"

import { cn } from "@/lib/utils"
import { MOCK_TREND_DATA } from "./data"
import type { TrendPoint } from "./types"

function barColor(value: number): string {
  if (value >= 96) return "bg-emerald-500"
  if (value >= 94) return "bg-amber-400"
  return "bg-red-500"
}

function SettlementBar({ point, maxVal }: { point: TrendPoint; maxVal: number }) {
  const pct = (point.value / maxVal) * 100
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5" role="img" aria-label={`${point.label}: ${point.value}%`}>
      <span className="text-xs font-medium" style={{ color: point.value >= 96 ? "#10b981" : point.value >= 94 ? "#f59e0b" : "#ef4444" }}>
        {point.value}%
      </span>
      <div className="w-full flex justify-center" style={{ height: 120 }}>
        <div
          className={cn("w-8 self-end rounded-t-sm transition-colors", barColor(point.value))}
          style={{ height: `${Math.max(pct, 4)}%` }}
        />
      </div>
      <span className="text-[11px] text-white/50">{point.label}</span>
    </div>
  )
}

export function SettlementPerformanceChart() {
  const data = MOCK_TREND_DATA.settlementPerformance
  const maxVal = Math.max(...data.map((d) => d.value))

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5" role="region" aria-label="Settlement performance chart">
      <h3 className="text-sm font-semibold text-white mb-0.5">Settlement Performance</h3>
      <p className="text-xs text-white/50 mb-5">Success rate by period</p>
      <div className="flex items-end gap-1 w-full" dir="ltr">
        {data.map((point) => (
          <SettlementBar key={point.date} point={point} maxVal={maxVal} />
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-white/50">
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded bg-emerald-500" /> &ge;96%</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded bg-amber-400" /> &ge;94%</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded bg-red-500" /> &lt;94%</span>
      </div>
    </div>
  )
}
