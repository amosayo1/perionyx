"use client"

import { useMemo } from "react"
import { MOCK_ACCOUNTS } from "./data"

const currencyColors: Record<string, string> = {
  USD: "from-blue-600 to-blue-400",
  EUR: "from-indigo-600 to-indigo-400",
  GBP: "from-violet-600 to-violet-400",
  AED: "from-cyan-600 to-cyan-400",
  ZAR: "from-amber-600 to-amber-400",
  SGD: "from-rose-600 to-rose-400",
  BRL: "from-green-600 to-green-400",
  CAD: "from-red-600 to-red-400",
  INR: "from-orange-600 to-orange-400",
  CNY: "from-yellow-600 to-yellow-400",
  AUD: "from-teal-600 to-teal-400",
  JPY: "from-pink-600 to-pink-400",
  CHF: "from-lime-600 to-lime-400",
  HKD: "from-sky-600 to-sky-400",
}

export function CurrencyDistributionChart() {
  const data = useMemo(() => {
    const counts = new Map<string, number>()
    for (const acc of MOCK_ACCOUNTS) {
      counts.set(acc.currency, (counts.get(acc.currency) || 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([currency, count]) => ({ currency, count }))
      .sort((a, b) => b.count - a.count)
  }, [])

  const maxCount = data[0]?.count || 1

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5" role="region" aria-label="Currency distribution">
      <h3 className="text-sm font-semibold text-white">Currency Distribution</h3>
      <p className="text-xs text-zinc-400 mt-0.5 mb-4">Accounts by currency</p>
      <div className="flex items-end gap-2 h-40" dir="ltr">
        {data.map(({ currency, count }) => {
          const pct = (count / maxCount) * 100
          return (
            <div key={currency} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-[10px] text-zinc-400">{count}</span>
              <div className="w-full rounded-t bg-zinc-800/60 overflow-hidden flex flex-col justify-end" style={{ height: `${pct}%` }}>
                <div
                  className={`w-full rounded-t bg-gradient-to-t ${currencyColors[currency] || "from-zinc-600 to-zinc-400"} transition-all`}
                  style={{ height: "100%" }}
                  aria-label={`${currency}: ${count} accounts`}
                />
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">{currency}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
