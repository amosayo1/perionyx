"use client"

import { cn } from "@/lib/utils"
import { MOCK_PAYMENTS } from "./data"

export function BankMovementChart() {
  const counts: Record<string, number> = {}
  for (const p of MOCK_PAYMENTS) {
    counts[p.bank] = (counts[p.bank] || 0) + 1
  }

  const entries = Object.entries(counts)
    .map(([bank, count]) => ({ bank, count }))
    .sort((a, b) => b.count - a.count)

  const maxCount = entries[0].count

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5" role="region" aria-label="Bank movement chart">
      <h3 className="text-sm font-semibold text-white mb-0.5">Payments by Bank</h3>
      <p className="text-xs text-white/50 mb-5">Transaction count per financial institution</p>
      <div className="flex flex-col gap-2 w-full" dir="ltr">
        {entries.map((e) => {
          const pct = (e.count / maxCount) * 100
          return (
            <div key={e.bank} className="flex items-center gap-3" role="img" aria-label={`${e.bank}: ${e.count} payments`}>
              <span className="text-xs text-white/70 w-36 flex-shrink-0 text-right">{e.bank}</span>
              <div className="flex-1 h-6 bg-zinc-800/60 rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm"
                  style={{
                    width: `${Math.max(pct, 2)}%`,
                    background: "linear-gradient(90deg, #f97316 0%, rgba(249,115,22,0.3) 100%)",
                  }}
                />
              </div>
              <span className="text-xs text-white/60 w-8 flex-shrink-0">{e.count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
