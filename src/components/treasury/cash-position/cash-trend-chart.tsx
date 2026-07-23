"use client";

import { cn } from "@/lib/utils";
import { MOCK_CASH_TREND_DATA } from "./data";

interface CashTrendChartProps {
  className?: string;
}

export function CashTrendChart({ className }: CashTrendChartProps) {
  const values = MOCK_CASH_TREND_DATA.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min;

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Total Cash Trend</h3>
      <p className="mb-4 text-[12px] text-zinc-500">Monthly trend (YTD)</p>

      <div className="relative h-48">
        <div className="absolute inset-0 flex items-end">
          {MOCK_CASH_TREND_DATA.map((point, i) => {
            const height = range > 0 ? ((point.value - min) / range) * 100 : 50;
            const barHeight = Math.max(8, (height / 100) * 160);

            return (
              <div key={point.date} className="flex flex-1 flex-col items-center justify-end h-full">
                <span className="mb-1 text-[10px] text-zinc-500">{formatCompact(point.value)}</span>
                <div
                  className="w-full mx-0.5 rounded-t bg-gradient-to-t from-[#c9a84c]/60 to-[#c9a84c]/30 transition-all hover:from-[#c9a84c]/80 hover:to-[#c9a84c]/50"
                  style={{ height: `${barHeight}px` }}
                  role="img"
                  aria-label={`${point.label}: ${formatCurrency(point.value)}`}
                />
                <span className="mt-1 text-[10px] text-zinc-600">{point.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  return `$${(value / 1_000).toFixed(0)}K`;
}

function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  return `$${(value / 1_000_000).toFixed(0)}M`;
}
