"use client"

import { cn } from "@/lib/utils"
import { MOCK_STRESS_TESTS } from "./data"

const BAR_MAX = 240

function formatCash(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  return `$${value.toFixed(0)}`
}

function formatType(type: string): string {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c: string) => c.toUpperCase())
}

export function StressImpactChart({ className }: { className?: string }) {
  const grouped: Record<string, { total: number; count: number }> = {}
  for (const test of MOCK_STRESS_TESTS) {
    if (!grouped[test.type]) grouped[test.type] = { total: 0, count: 0 }
    grouped[test.type].total += Math.abs(test.impact)
    grouped[test.type].count += 1
  }
  const entries = Object.entries(grouped).map(([type, { total, count }]) => ({
    type,
    avgImpact: total / count,
  }))
  const maxVal = Math.max(...entries.map((e) => e.avgImpact), 1)

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Stress Impact</h3>
      <p className="mt-0.5 text-xs text-zinc-400">Average impact by stress type</p>
      <div className="mt-4" dir="ltr" aria-label="Stress impact chart">
        <div className="flex flex-col gap-2">
          {entries.map((entry, i) => {
            const pct = (entry.avgImpact / maxVal) * 100
            const barW = Math.max((pct / 100) * BAR_MAX, 4)
            const intensity = Math.min(Math.floor(pct / 20), 4)
            const shades = ["bg-red-300/40","bg-red-400/50","bg-red-500/60","bg-red-600/80","bg-red-700"]
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="w-28 text-[11px] text-zinc-300 text-right shrink-0">
                  {formatType(entry.type)}
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <div
                    className={`h-5 rounded-sm ${shades[intensity]}`}
                    style={{ width: barW }}
                    role="img"
                    aria-label={`${formatType(entry.type)}: ${formatCash(entry.avgImpact)} avg impact`}
                  />
                  <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                    {formatCash(entry.avgImpact)}
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