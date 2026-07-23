"use client"

import { useMemo } from "react"
import { MOCK_TREND_DATA } from "./data"

export function DormancyTrendChart() {
  const data = useMemo(() => MOCK_TREND_DATA.dormancyTrend, [])
  const maxVal = Math.max(...data.map((d) => d.value), 1)

  const barColor = (value: number) => {
    if (value > 200) return "from-red-700 to-red-400"
    if (value > 150) return "from-amber-700 to-amber-400"
    return "from-emerald-700 to-emerald-400"
  }

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5" role="region" aria-label="Dormancy trend">
      <h3 className="text-sm font-semibold text-white">Dormancy Trend</h3>
      <p className="text-xs text-zinc-400 mt-0.5 mb-4">7-month trend</p>
      <div className="flex items-end gap-2 h-36" dir="ltr">
        {data.map((point) => {
          const pct = (point.value / maxVal) * 100
          return (
            <div key={point.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className={`text-[10px] font-medium tabular-nums ${
                point.value > 200 ? "text-red-400" : point.value > 150 ? "text-amber-400" : "text-emerald-400"
              }`}>{point.value}</span>
              <div className="w-full rounded-t overflow-hidden flex flex-col justify-end" style={{ height: `${pct}%` }}>
                <div
                  className={`w-full rounded-t bg-gradient-to-t ${barColor(point.value)} transition-all`}
                  style={{ height: "100%" }}
                  aria-label={`${point.label}: ${point.value} dormant accounts`}
                />
              </div>
              <span className="text-[10px] text-zinc-500 truncate w-full text-center">{point.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
