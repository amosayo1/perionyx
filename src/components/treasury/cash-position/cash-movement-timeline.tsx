"use client";

import { cn } from "@/lib/utils";
import { MOCK_CASH_MOVEMENTS } from "./data";

interface CashMovementTimelineProps {
  className?: string;
}

export function CashMovementTimeline({ className }: CashMovementTimelineProps) {
  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Cash Movement Timeline</h3>
      <p className="mb-4 text-[12px] text-zinc-500">Today&apos;s cash flow waterfall</p>

      <div className="relative space-y-0">
        {MOCK_CASH_MOVEMENTS.map((event, i) => {
          const isLast = i === MOCK_CASH_MOVEMENTS.length - 1;
          const isOpening = event.type === "opening";
          const isClosing = event.type === "closing";

          return (
            <div key={event.id} className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "z-10 flex h-6 w-6 items-center justify-center rounded-full border-2",
                  isOpening ? "border-zinc-500 bg-zinc-800" :
                  isClosing ? "border-[#c9a84c] bg-[#c9a84c]/10" :
                  event.amount >= 0 ? "border-emerald-500 bg-emerald-500/10" :
                  "border-red-500 bg-red-500/10",
                )}>
                  <span className={cn(
                    "text-[10px] font-bold",
                    isOpening ? "text-zinc-400" :
                    isClosing ? "text-[#c9a84c]" :
                    event.amount >= 0 ? "text-emerald-400" : "text-red-400",
                  )}>
                    {isOpening ? "O" : isClosing ? "C" : i}
                  </span>
                </div>
                {!isLast && <div className="w-px flex-1 bg-white/[0.06]" />}
              </div>
              <div className={cn("pb-5", isLast && "pb-0")}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-medium text-white">{event.label}</p>
                    <p className="text-[11px] text-zinc-500">{event.description}</p>
                  </div>
                  <span className={cn(
                    "text-sm font-semibold whitespace-nowrap",
                    isOpening ? "text-zinc-400" :
                    isClosing ? "text-[#c9a84c]" :
                    event.amount >= 0 ? "text-emerald-400" : "text-red-400",
                  )}>
                    {event.amount >= 0 ? "+" : ""}{formatCurrency(event.amount)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}
