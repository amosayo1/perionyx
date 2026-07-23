"use client"

import { cn } from "@/lib/utils"
import { MOCK_PAYMENTS } from "./data"

function formatCurrency(value: number): string {
  return `$${(value / 1000000).toLocaleString("en-US", { maximumFractionDigits: 1 })}M`
}

export function CurrencyMovementChart() {
  const sums: Record<string, number> = {}
  for (const p of MOCK_PAYMENTS) {
    sums[p.currency] = (sums[p.currency] || 0) + p.amount
  }

  const entries = Object.entries(sums)
    .map(([currency, total]) => ({ currency, total }))
    .sort((a, b) => b.total - a.total)

  const maxTotal = entries[0].total

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5" role="region" aria-label="Currency movement chart">
      <h3 className="text-sm font-semibold text-white mb-0.5">Payments by Currency</h3>
      <p className="text-xs text-white/50 mb-5">Total payment value per currency</p>
      <div className="flex flex-col gap-2.5 w-full" dir="ltr">
        {entries.map((e) => {
          const pct = (e.total / maxTotal) * 100
          return (
            <div key={e.currency} className="flex items-center gap-3" role="img" aria-label={`${e.currency}: ${formatCurrency(e.total)}`}>
              <span className="text-xs text-white/70 font-mono w-10 flex-shrink-0">{e.currency}</span>
              <div className="flex-1 h-7 bg-zinc-800/60 rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm"
                  style={{
                    width: `${Math.max(pct, 2)}%`,
                    background: "linear-gradient(90deg, #06b6d4 0%, rgba(6,182,212,0.3) 100%)",
                  }}
                />
              </div>
              <span className="text-xs text-white/60 font-mono w-20 flex-shrink-0 text-right">{formatCurrency(e.total)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
