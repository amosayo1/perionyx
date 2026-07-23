"use client";

import { cn } from "@/lib/utils";
import { MOCK_DAILY_VARIANCE } from "./data";

interface DailyCashVarianceProps {
  className?: string;
}

export function DailyCashVariance({ className }: DailyCashVarianceProps) {
  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Daily Cash Variance</h3>
      <p className="mb-4 text-[12px] text-zinc-500">7-day cash flow trend</p>

      <div className="space-y-2">
        {MOCK_DAILY_VARIANCE.map((day) => {
          const maxAbs = Math.max(...MOCK_DAILY_VARIANCE.map((d) => Math.max(Math.abs(d.collections), Math.abs(d.payments))));
          const collectionsWidth = (day.collections / maxAbs) * 100;
          const paymentsWidth = (Math.abs(day.payments) / maxAbs) * 100;

          return (
            <div key={day.date} className="flex items-center gap-3">
              <span className="w-14 text-[12px] text-zinc-500 shrink-0">{day.date}</span>
              <div className="flex flex-1 items-center gap-1">
                <div className="flex-1">
                  <div className="flex justify-end">
                    <div
                      className="h-2.5 rounded-l-full bg-emerald-500/60"
                      style={{ width: `${collectionsWidth}%` }}
                      role="progressbar"
                      aria-valuenow={collectionsWidth}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Collections: ${formatCurrency(day.collections)}`}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div
                    className="h-2.5 rounded-r-full bg-red-500/60"
                    style={{ width: `${paymentsWidth}%` }}
                    role="progressbar"
                    aria-valuenow={paymentsWidth}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Payments: ${formatCurrency(Math.abs(day.payments))}`}
                  />
                </div>
              </div>
              <span className={cn(
                "w-20 text-right text-[12px] font-medium",
                day.netChange >= 0 ? "text-emerald-400" : "text-red-400",
              )}>
                {day.netChange >= 0 ? "+" : ""}{formatCurrency(day.netChange)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-zinc-500">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
          Collections
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          Payments
        </div>
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}
