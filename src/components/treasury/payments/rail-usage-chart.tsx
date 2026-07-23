"use client"

import { cn } from "@/lib/utils"
import { MOCK_PAYMENT_RAILS } from "./data"

function formatCount(value: number): string {
  return value.toLocaleString("en-US")
}

export function RailUsageChart() {
  const sorted = [...MOCK_PAYMENT_RAILS].sort((a, b) => b.volume - a.volume)
  const maxVol = sorted[0].volume

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5" role="region" aria-label="Rail usage chart">
      <h3 className="text-sm font-semibold text-white mb-0.5">Rail Usage</h3>
      <p className="text-xs text-white/50 mb-5">Transaction volume by payment rail</p>
      <div className="flex flex-col gap-2.5 w-full" dir="ltr">
        {sorted.map((rail) => {
          const pct = (rail.volume / maxVol) * 100
          return (
            <div key={rail.id} className="flex items-center gap-3" role="img" aria-label={`${rail.name}: ${formatCount(rail.volume)} transactions`}>
              <span className="text-xs text-white/70 w-28 flex-shrink-0 text-right">{rail.name}</span>
              <div className="flex-1 h-7 bg-zinc-800/60 rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm"
                  style={{
                    width: `${Math.max(pct, 2)}%`,
                    background: "linear-gradient(90deg, #6366f1 0%, rgba(99,102,241,0.4) 100%)",
                  }}
                />
              </div>
              <span className="text-xs text-white/60 w-20 flex-shrink-0">{formatCount(rail.volume)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
