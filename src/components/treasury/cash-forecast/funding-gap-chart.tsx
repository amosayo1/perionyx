"use client"

import { cn } from "@/lib/utils"
import { MOCK_FUNDING } from "./data"

const MAX_HEIGHT = 200

function formatCash(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

function getMonthLabel(period: string): string {
  const m = period.split("-")[1]
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  return months[parseInt(m, 10) - 1] ?? period
}

export function FundingGapChart({ className }: { className?: string }) {
  const records = MOCK_FUNDING.slice(0, 12)
  const maxVal = Math.max(...records.map((r) => r.fundingGap), 1)

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Funding Gap</h3>
      <p className="mt-0.5 text-xs text-zinc-400">Projected funding shortfall</p>
      <div className="mt-4" dir="ltr" aria-label="Funding gap chart">
        <div className="flex items-end gap-1.5" style={{ height: MAX_HEIGHT }}>
          {records.map((rec, i) => {
            const pct = (rec.fundingGap / maxVal) * 100
            const barH = Math.max((pct / 100) * MAX_HEIGHT, 2)
            return (
              <div key={rec.id} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-red-400">
                  {formatCash(rec.fundingGap)}
                </span>
                <div
                  className="w-full rounded-sm bg-red-500/80"
                  style={{ height: barH }}
                  role="img"
                  aria-label={`${getMonthLabel(rec.period)}: ${formatCash(rec.fundingGap)} gap`}
                />
                <span className="text-[10px] text-zinc-600">{getMonthLabel(rec.period)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}