"use client"

import { cn } from "@/lib/utils"
import { MOCK_TREND_DATA } from "./data"
import type { TrendPoint } from "./types"

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}

function CashMovementBar({ point, maxVal }: { point: TrendPoint; maxVal: number }) {
  const pct = (point.value / maxVal) * 100
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5" role="img" aria-label={`${point.label}: ${formatCurrency(point.value)}`}>
      <span className="text-xs text-white/70 font-medium">{formatCurrency(point.value)}</span>
      <div className="w-full flex justify-center" style={{ height: 120 }}>
        <div
          className="w-8 self-end rounded-t-sm"
          style={{
            height: `${Math.max(pct * 1.1, 4)}%`,
            background: "linear-gradient(180deg, #c9a84c 0%, rgba(201,168,76,0.3) 100%)",
          }}
        />
      </div>
      <span className="text-[11px] text-white/50">{point.label}</span>
    </div>
  )
}

export function CashMovementTrendChart() {
  const data = MOCK_TREND_DATA.cashMovement
  const maxVal = Math.max(...data.map((d) => d.value))

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5" role="region" aria-label="Cash movement trend chart">
      <h3 className="text-sm font-semibold text-white mb-0.5">Cash Movement</h3>
      <p className="text-xs text-white/50 mb-5">Daily cash balance over time</p>
      <div className="flex items-end gap-1 w-full" dir="ltr">
        {data.map((point) => (
          <CashMovementBar key={point.date} point={point} maxVal={maxVal} />
        ))}
      </div>
    </div>
  )
}
