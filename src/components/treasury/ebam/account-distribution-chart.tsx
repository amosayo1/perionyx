"use client"

import { useMemo } from "react"
import { MOCK_ACCOUNTS } from "./data"

const typeLabels: Record<string, string> = {
  checking: "Checking",
  savings: "Savings",
  money_market: "Money Market",
  escrow: "Escrow",
  payroll: "Payroll",
  tax: "Tax",
  investment: "Investment",
  collateral: "Collateral",
  concentration: "Concentration",
  disbursement: "Disbursement",
  multi_currency: "Multi-Currency",
  overdraft: "Overdraft",
}

export function AccountDistributionChart() {
  const data = useMemo(() => {
    const counts = new Map<string, number>()
    for (const acc of MOCK_ACCOUNTS) {
      counts.set(acc.accountType, (counts.get(acc.accountType) || 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([type, count]) => ({ type, label: typeLabels[type] || type, count }))
      .sort((a, b) => b.count - a.count)
  }, [])

  const maxCount = data[0]?.count || 1

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5" role="region" aria-label="Account distribution by type">
      <h3 className="text-sm font-semibold text-white">Account Distribution</h3>
      <p className="text-xs text-zinc-400 mt-0.5 mb-4">Count by account type</p>
      <div className="space-y-2.5" dir="ltr">
        {data.map(({ type, label, count }) => (
          <div key={type} className="flex items-center gap-3">
            <span className="text-xs text-zinc-300 w-28 shrink-0 truncate">{label}</span>
            <div className="flex-1 h-5 bg-zinc-800/60 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all"
                style={{ width: `${(count / maxCount) * 100}%` }}
                aria-label={`${label}: ${count} accounts`}
              />
            </div>
            <span className="text-xs text-zinc-400 w-10 text-right shrink-0">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
