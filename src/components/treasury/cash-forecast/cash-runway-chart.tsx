"use client"

import { cn } from "@/lib/utils"
import { MOCK_TREND_DATA } from "./data"

const MAX_HEIGHT = 200

function formatDays(days: number): string {
  if (days >= 365) return `${(days / 365).toFixed(1)}yr`
  return `${days}d`
}

export function CashRunwayChart({ className }: { className?: string }) {
  const data = MOCK_TREND_DATA.cashRunway
  const maxVal = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Cash Runway</h3>
      <p className="mt-0.5 text-xs text-zinc-400">Days of cash remaining</p>
      <div className="mt-4" dir="ltr" aria-label="Cash runway chart">
        <div className="flex items-end gap-1.5" style={{ height: MAX_HEIGHT }}>
          {data.map((point, i) => {
            const pct = (point.value / maxVal) * 100
            const barH = Math.max((pct / 100) * MAX_HEIGHT, 2)
            const color =
              point.value >= 180
                ? "bg-emerald-500"
                : point.value >= 90
                  ? "bg-amber-500"
                  : "bg-red-500"
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-zinc-400">
                  {formatDays(point.value)}
                </span>
                <div
                  className={`w-full rounded-sm ${color}`}
                  style={{ height: barH }}
                  role="img"
                  aria-label={`${point.label}: ${point.value} days`}
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