"use client"

import { useMemo } from "react"
import { MOCK_TREND_DATA } from "./data"

export function KycCompletionChart() {
  const data = useMemo(() => MOCK_TREND_DATA.kycCompletion, [])
  const maxVal = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5" role="region" aria-label="KYC completion trend">
      <h3 className="text-sm font-semibold text-white">KYC Completion</h3>
      <p className="text-xs text-zinc-400 mt-0.5 mb-4">7-month trend</p>
      <div className="flex items-end gap-2 h-36" dir="ltr">
        {data.map((point) => {
          const pct = (point.value / maxVal) * 100
          return (
            <div key={point.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-[10px] text-purple-400 font-medium tabular-nums">{point.value}%</span>
              <div className="w-full rounded-t overflow-hidden flex flex-col justify-end" style={{ height: `${pct}%` }}>
                <div
                  className="w-full rounded-t bg-gradient-to-t from-purple-700 to-purple-400 transition-all"
                  style={{ height: "100%" }}
                  aria-label={`${point.label}: ${point.value}%`}
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
