"use client"

import { cn } from "@/lib/utils"
import { MOCK_TREND_DATA } from "./data"
import type { TrendPoint } from "./types"

function PaymentVolumeBar({ point, maxVal }: { point: TrendPoint; maxVal: number }) {
  const pct = (point.value / maxVal) * 100
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5" role="img" aria-label={`${point.label}: ${point.value} payments`}>
      <span className="text-[11px] text-white/70 font-medium">{point.value}</span>
      <div className="w-full flex justify-center" style={{ height: 120 }}>
        <div
          className="w-8 self-end rounded-t-sm"
          style={{
            height: `${Math.max(pct * 1.1, 4)}%`,
            background: "linear-gradient(180deg, #3b82f6 0%, rgba(59,130,246,0.25) 100%)",
          }}
        />
      </div>
      <span className="text-[11px] text-white/50 whitespace-nowrap">{point.label}</span>
    </div>
  )
}

export function PaymentVolumeChart() {
  const data = MOCK_TREND_DATA.paymentVolume
  const maxVal = Math.max(...data.map((d) => d.value))

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5" role="region" aria-label="Payment volume chart">
      <h3 className="text-sm font-semibold text-white mb-0.5">Payment Volume</h3>
      <p className="text-xs text-white/50 mb-5">Transaction count per period</p>
      <div className="flex items-end gap-1 w-full" dir="ltr">
        {data.map((point) => (
          <PaymentVolumeBar key={point.date} point={point} maxVal={maxVal} />
        ))}
      </div>
    </div>
  )
}
