"use client";

import { cn } from "@/lib/utils";
import { PieChart } from "lucide-react";
import { MOCK_CASH_COMPOSITION } from "./data";

interface CashCompositionCardProps {
  className?: string;
}

export function CashCompositionCard({ className }: CashCompositionCardProps) {
  const total = MOCK_CASH_COMPOSITION.reduce((s, c) => s + c.amount, 0);

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">Cash Composition</h3>
          <p className="text-[12px] text-zinc-500">By classification</p>
        </div>
        <PieChart className="h-4 w-4 text-zinc-500" />
      </div>

      <div className="mt-5 space-y-2">
        {MOCK_CASH_COMPOSITION.map((item) => (
          <div key={item.classification}>
            <div className="mb-1 flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", item.color.replace("text-", "bg-").replace("-400", "-500"))} />
                <span className="text-zinc-300">{item.classification}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{formatCurrency(item.amount)}</span>
                <span className="text-zinc-500 w-12 text-right">{item.percentage.toFixed(1)}%</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-800">
              <div
                className={cn("h-full rounded-full transition-all", item.color.replace("text-", "bg-").replace("-400", "-500/70"))}
                style={{ width: `${item.percentage}%` }}
                role="progressbar"
                aria-valuenow={item.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${item.classification}: ${item.percentage.toFixed(1)}%`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-white/[0.06] pt-3">
        <div className="flex items-center justify-between text-[13px]">
          <span className="font-medium text-white">Total</span>
          <span className="font-semibold text-white">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}
