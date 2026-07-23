"use client"

import { cn } from "@/lib/utils"
import { MOCK_TREND_DATA } from "./data"

const MAX_HEIGHT = 200

export function ForecastConfidenceChart({ className }: { className?: string }) {
  const data = MOCK_TREND_DATA.forecastConfidence
  const maxVal = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Forecast Confidence</h3>
      <p className="mt-0.5 text-xs text-zinc-400">Confidence score by month</p>
      <div className="mt-4" dir="ltr" aria-label="Forecast confidence chart">
        <div className="flex items-end gap-1.5" style={{ height: MAX_HEIGHT }}>
          {data.map((point, i) => {
            const pct = (point.value / maxVal) * 100
            const barH = Math.max((pct / 100) * MAX_HEIGHT, 2)
            const color =
              point.value >= 85
                ? "bg-emerald-500"
                : point.value >= 70
                  ? "bg-blue-500"
                  : point.value >= 60
                    ? "bg-amber-500"
                    : "bg-red-500"
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-zinc-400">
                  {point.value}%
                </span>
                <div
                  className={`w-full rounded-sm ${color}`}
                  style={{ height: barH }}
                  role="img"
                  aria-label={`${point.label}: ${point.value}% confidence`}
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