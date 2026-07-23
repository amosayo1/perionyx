"use client"

import { cn } from "@/lib/utils"
import { MOCK_PAYMENTS } from "./data"

export function EntityPaymentChart() {
  const counts: Record<string, number> = {}
  for (const p of MOCK_PAYMENTS) {
    counts[p.entity] = (counts[p.entity] || 0) + 1
  }

  const entries = Object.entries(counts)
    .map(([entity, count]) => ({ entity, count }))
    .sort((a, b) => b.count - a.count)

  const maxCount = entries[0].count

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5" role="region" aria-label="Entity payment chart">
      <h3 className="text-sm font-semibold text-white mb-0.5">Payments by Entity</h3>
      <p className="text-xs text-white/50 mb-5">Transaction volume per legal entity</p>
      <div className="flex items-end gap-1.5 w-full overflow-x-auto pb-1" dir="ltr">
        {entries.map((e) => {
          const pct = (e.count / maxCount) * 100
          return (
            <div key={e.entity} className="flex flex-col items-center gap-1 min-w-[48px]" role="img" aria-label={`${e.entity}: ${e.count} payments`}>
              <span className="text-[11px] text-white/70 font-medium">{e.count}</span>
              <div className="w-full flex justify-center" style={{ height: 100 }}>
                <div
                  className="w-full max-w-[32px] self-end rounded-t-sm"
                  style={{
                    height: `${Math.max(pct, 4)}%`,
                    background: "linear-gradient(180deg, #a78bfa 0%, rgba(167,139,250,0.25) 100%)",
                  }}
                />
              </div>
              <span className="text-[10px] text-white/50 text-center leading-tight max-w-[56px] break-words">
                {e.entity.replace(/^Perionyx /, "")}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
