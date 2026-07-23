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

function getMonthLabel(period: string): string {
  const m = period.split("-")[1]
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  return months[parseInt(m, 10) - 1] ?? period
}

export function ForecastVsActualChart({ className }: { className?: string }) {
  const records = MOCK_FORECASTS.filter((f) => f.horizon === "monthly").slice(0, 8)
  const allValues = records.flatMap((r) => [r.endingCash, r.endingCash - r.variance])
  const maxVal = Math.max(...allValues, 1)

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Forecast vs Actual</h3>
      <p className="mt-0.5 text-xs text-zinc-400">Projected vs realized cash</p>
      <div className="mt-4" dir="ltr" aria-label="Forecast vs actual chart">
        <div className="flex items-end gap-2" style={{ height: MAX_HEIGHT }}>
          {records.map((rec, i) => {
            const forecasted = rec.endingCash
            const actual = rec.endingCash - rec.variance
            const fPct = (forecasted / maxVal) * 100
            const aPct = (actual / maxVal) * 100
            const fH = Math.max((fPct / 100) * MAX_HEIGHT, 2)
            const aH = Math.max((aPct / 100) * MAX_HEIGHT, 2)
            return (
              <div key={rec.id} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[9px] text-zinc-500">{formatCash(actual)}</span>
                <div className="flex w-full gap-0.5">
                  <div
                    className="flex-1 rounded-sm bg-blue-500/70"
                    style={{ height: fH }}
                    role="img"
                    aria-label={`Forecast ${getMonthLabel(rec.period)}: ${formatCash(forecasted)}`}
                  />
                  <div
                    className="flex-1 rounded-sm bg-emerald-500/70"
                    style={{ height: aH }}
                    role="img"
                    aria-label={`Actual ${getMonthLabel(rec.period)}: ${formatCash(actual)}`}
                  />
                </div>
                <span className="text-[10px] text-zinc-600">{getMonthLabel(rec.period)}</span>
              </div>
            )
          })}
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-blue-500/70" />
            <span className="text-zinc-400">Forecast</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/70" />
            <span className="text-zinc-400">Actual</span>
          </div>
        </div>
      </div>
    </div>
  )
}