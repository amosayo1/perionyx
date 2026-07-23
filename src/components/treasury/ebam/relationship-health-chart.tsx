"use client"

import { useMemo } from "react"
import { MOCK_RELATIONSHIPS } from "./data"

const scoreColor = (score: number) => {
  if (score > 80) return "bg-emerald-500"
  if (score > 60) return "bg-blue-500"
  if (score > 40) return "bg-amber-500"
  return "bg-red-500"
}

const scoreLabel = (score: number) => {
  if (score > 80) return "Strong"
  if (score > 60) return "Good"
  if (score > 40) return "Fair"
  return "Weak"
}

const tierLabel = (score: number) => {
  if (score >= 90) return "Platinum"
  if (score >= 80) return "Gold"
  if (score >= 65) return "Silver"
  return "Bronze"
}

export function RelationshipHealthChart() {
  const data = useMemo(() => {
    return [...MOCK_RELATIONSHIPS]
      .map((r) => ({ bank: r.bankName, score: r.scoreValue }))
      .sort((a, b) => a.score - b.score)
  }, [])

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5" role="region" aria-label="Relationship health chart">
      <h3 className="text-sm font-semibold text-white">Relationship Health</h3>
      <p className="text-xs text-zinc-400 mt-0.5 mb-4">Score by bank</p>
      <div className="space-y-3" dir="ltr">
        {data.map(({ bank, score }) => (
          <div key={bank} className="flex items-center gap-3">
            <span className="text-xs text-zinc-300 w-36 shrink-0 truncate">{bank}</span>
            <div className="flex-1">
              <div className="h-2.5 bg-zinc-800/60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${scoreColor(score)}`}
                  style={{ width: `${score}%` }}
                  aria-label={`${bank}: ${score}% - ${scoreLabel(score)}`}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 w-28 shrink-0 justify-end">
              <span className="text-xs text-zinc-400 tabular-nums w-8 text-right">{score}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                score > 80 ? "text-emerald-400 bg-emerald-500/10" :
                score > 60 ? "text-blue-400 bg-blue-500/10" :
                score > 40 ? "text-amber-400 bg-amber-500/10" :
                "text-red-400 bg-red-500/10"
              }`}>{tierLabel(score)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
