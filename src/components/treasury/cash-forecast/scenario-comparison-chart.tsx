"use client"

import { cn } from "@/lib/utils"
import { MOCK_SCENARIO_COMPARISONS } from "./data"

const BAR_MAX = 240

function formatCash(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  return `$${value.toFixed(0)}`
}

function riskColor(risk: string): string {
  switch (risk) {
    case "low": return "bg-emerald-500"
    case "medium": return "bg-amber-500"
    case "high": return "bg-orange-500"
    case "critical": return "bg-red-500"
    default: return "bg-zinc-500"
  }
}

export function ScenarioComparisonChart({ className }: { className?: string }) {
  const data = MOCK_SCENARIO_COMPARISONS
  const maxVal = Math.max(...data.map((d) => d.projectedCash), 1)

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Scenario Comparison</h3>
      <p className="mt-0.5 text-xs text-zinc-400">Projected cash by scenario</p>
      <div className="mt-4" dir="ltr" aria-label="Scenario comparison chart">
        <div className="flex flex-col gap-2">
          {data.map((scenario, i) => {
            const pct = (scenario.projectedCash / maxVal) * 100
            const barW = Math.max((pct / 100) * BAR_MAX, 4)
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="w-28 text-[11px] text-zinc-300 text-right shrink-0">
                  {scenario.scenario}
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <div
                    className={`h-5 rounded-sm ${riskColor(scenario.risk)}`}
                    style={{ width: barW }}
                    role="img"
                    aria-label={`${scenario.scenario}: ${formatCash(scenario.projectedCash)}`}
                  />
                  <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                    {formatCash(scenario.projectedCash)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}