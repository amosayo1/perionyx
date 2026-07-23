"use client"

import { useMemo } from "react"
import { MOCK_ACCOUNTS } from "./data"

const stages = ["requested", "opening", "pending_documentation", "kyc_review", "approval", "active", "dormant", "restricted", "closing", "closed"] as const

const stageLabels: Record<string, string> = {
  requested: "Requested",
  opening: "Opening",
  pending_documentation: "Pending Docs",
  kyc_review: "KYC Review",
  approval: "Approval",
  active: "Active",
  dormant: "Dormant",
  restricted: "Restricted",
  closing: "Closing",
  closed: "Closed",
}

const stageColors: Record<string, string> = {
  requested: "bg-sky-500",
  opening: "bg-blue-500",
  pending_documentation: "bg-amber-500",
  kyc_review: "bg-violet-500",
  approval: "bg-indigo-500",
  active: "bg-emerald-500",
  dormant: "bg-zinc-500",
  restricted: "bg-orange-500",
  closing: "bg-red-500",
  closed: "bg-zinc-600",
}

export function LifecycleChart() {
  const data = useMemo(() => {
    const counts = new Map<string, number>()
    for (const acc of MOCK_ACCOUNTS) {
      counts.set(acc.lifecycle, (counts.get(acc.lifecycle) || 0) + 1)
    }
    return stages.map((stage) => ({
      stage,
      label: stageLabels[stage] || stage,
      count: counts.get(stage) || 0,
    }))
  }, [])

  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5" role="region" aria-label="Lifecycle distribution">
      <h3 className="text-sm font-semibold text-white">Lifecycle Stages</h3>
      <p className="text-xs text-zinc-400 mt-0.5 mb-4">Account lifecycle distribution</p>
      <div className="space-y-2" dir="ltr">
        {data.map(({ stage, label, count }) => (
          <div key={stage} className="flex items-center gap-3">
            <span className="text-xs text-zinc-300 w-28 shrink-0 truncate">{label}</span>
            <div className="flex-1 h-5 bg-zinc-800/60 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${stageColors[stage] || "bg-zinc-500"}`}
                style={{ width: `${(count / maxCount) * 100}%` }}
                aria-label={`${label}: ${count} accounts`}
              />
            </div>
            <span className="text-xs text-zinc-400 w-8 text-right shrink-0">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
