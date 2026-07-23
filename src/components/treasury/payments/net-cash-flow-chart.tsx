"use client"

import { cn } from "@/lib/utils"
import { MOCK_TREND_DATA } from "./data"
import type { TrendPoint } from "./types"

function formatCurrency(value: number): string {
  const abs = Math.abs(value)
  const formatted = `$${abs.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
  return value < 0 ? `-${formatted}` : formatted
}

function NetCashFlowBar({ point, maxAbs }: { point: TrendPoint; maxAbs: number }) {
  const isNeg = point.value < 0
  const absVal = Math.abs(point.value)
  const pct = (absVal / maxAbs) * 100

  return (
    <div className="flex flex-1 flex-col items-center gap-1" role="img" aria-label={`${point.label}: ${formatCurrency(point.value)}`}>
      <span className={cn("text-[11px] font-medium", isNeg ? "text-red-400" : "text-emerald-400")}>
        {formatCurrency(point.value)}
      </span>
      <div className="w-full flex justify-center" style={{ height: 120 }}>
        <div
          className={cn("w-8 self-end rounded-sm", isNeg ? "bg-red-500/80" : "bg-emerald-500/80")}
          style={{ height: `${Math.max(pct, 4)}%` }}
        />
      </div>
      <span className="text-[11px] text-white/50">{point.label}</span>
    </div>
  )
}

export function NetCashFlowChart() {
  const data = MOCK_TREND_DATA.netCashFlow
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.value)))

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5" role="region" aria-label="Net cash flow chart">
      <h3 className="text-sm font-semibold text-white mb-0.5">Net Cash Flow</h3>
      <p className="text-xs text-white/50 mb-5">Period-over-period net movement</p>
      <div className="flex items-end gap-1 w-full" dir="ltr">
        {data.map((point) => (
          <NetCashFlowBar key={point.date} point={point} maxAbs={maxAbs} />
        ))}
      </div>
    </div>
  )
}
