"use client"

import { useMemo } from "react"
import { MOCK_RELATIONSHIPS } from "./data"

const formatBalance = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(n)

export function BankExposureChart() {
  const data = useMemo(() => {
    return [...MOCK_RELATIONSHIPS]
      .map((r) => ({ bank: r.bankName, balance: r.totalBalance }))
      .sort((a, b) => b.balance - a.balance)
  }, [])

  const maxBalance = data[0]?.balance || 1

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5" role="region" aria-label="Bank exposure chart">
      <h3 className="text-sm font-semibold text-white">Bank Exposure</h3>
      <p className="text-xs text-zinc-400 mt-0.5 mb-4">Total balance by bank</p>
      <div className="space-y-2.5" dir="ltr">
        {data.map(({ bank, balance }) => {
          const exposure = Math.abs(balance)
          const pct = (exposure / maxBalance) * 100
          return (
            <div key={bank} className="flex items-center gap-3">
              <span className="text-xs text-zinc-300 w-36 shrink-0 truncate">{bank}</span>
              <div className="flex-1 h-5 bg-zinc-800/60 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-600/80 to-red-400 transition-all"
                  style={{ width: `${pct}%` }}
                  aria-label={`${bank}: ${formatBalance(balance)}`}
                />
              </div>
              <span className="text-xs text-zinc-400 w-20 text-right shrink-0 tabular-nums">{formatBalance(balance)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
