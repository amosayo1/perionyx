"use client"

import { cn } from "@/lib/utils"
import { MOCK_PAYMENTS } from "./data"

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-zinc-500" },
  pending_approval: { label: "Pending Approval", color: "bg-amber-400" },
  approved: { label: "Approved", color: "bg-emerald-500" },
  queued: { label: "Queued", color: "bg-blue-400" },
  processing: { label: "Processing", color: "bg-blue-600" },
  settled: { label: "Settled", color: "bg-green-600" },
  failed: { label: "Failed", color: "bg-red-500" },
  cancelled: { label: "Cancelled", color: "bg-zinc-600" },
}

export function PaymentStatusChart() {
  const counts: Record<string, number> = {}
  for (const p of MOCK_PAYMENTS) {
    counts[p.status] = (counts[p.status] || 0) + 1
  }

  const entries = Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
    key,
    count: counts[key] || 0,
    ...cfg,
  }))

  const total = entries.reduce((s, e) => s + e.count, 0)

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5" role="region" aria-label="Payment status breakdown chart">
      <h3 className="text-sm font-semibold text-white mb-0.5">Payment Status</h3>
      <p className="text-xs text-white/50 mb-5">Breakdown by current status</p>

      <div className="flex h-8 w-full rounded overflow-hidden mb-4" dir="ltr" role="img" aria-label={`${total} total payments across ${entries.length} statuses`}>
        {entries.map((e) => (
          <div
            key={e.key}
            className={cn(e.color, "h-full transition-all")}
            style={{ width: `${(e.count / total) * 100}%` }}
            aria-label={`${e.label}: ${e.count} payments (${Math.round((e.count / total) * 100)}%)`}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
        {entries.map((e) => (
          <div key={e.key} className="flex items-center gap-2 text-xs">
            <span className={cn("inline-block w-2.5 h-2.5 rounded flex-shrink-0", e.color)} />
            <span className="text-white/70">{e.label}</span>
            <span className="text-white/50 ml-auto">{e.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
