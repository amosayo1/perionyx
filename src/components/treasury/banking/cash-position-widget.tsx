"use client";

import { cn } from "@/lib/utils";
import type { CashPosition } from "@/server/banking/workspace";

interface CashPositionWidgetProps {
  position: CashPosition;
  className?: string;
}

export function CashPositionWidget({ position, className }: CashPositionWidgetProps) {
  const maxVal = position.totalCash;
  const bars = [
    { label: "Available", value: position.availableCash, color: "bg-emerald-500" },
    { label: "Restricted", value: position.restrictedCash, color: "bg-amber-500" },
    { label: "Investment", value: position.investmentCash, color: "bg-blue-500" },
  ];

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/40 p-5", className)}>
      <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-zinc-500">Cash Position</p>
      <p className="mt-1 text-[28px] font-bold tracking-[-0.02em] text-white">
        {position.totalCash.toLocaleString("en-US", { style: "currency", currency: position.currency, minimumFractionDigits: 0 })}
      </p>
      <p className="mt-1 text-[11px] text-zinc-500">As of {new Date(position.asOf).toLocaleString()}</p>

      <div className="mt-4 space-y-3">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="mb-1 flex items-center justify-between text-[12px]">
              <span className="text-zinc-400">{bar.label}</span>
              <span className="font-medium text-white">
                {bar.value.toLocaleString("en-US", { style: "currency", currency: position.currency, minimumFractionDigits: 0 })}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={cn("h-full rounded-full transition-all", bar.color)}
                style={{ width: `${(bar.value / maxVal) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}