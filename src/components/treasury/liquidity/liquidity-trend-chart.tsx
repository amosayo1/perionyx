"use client";

import { cn } from "@/lib/utils";
import { MOCK_TREND_DATA } from "./data";

export function LiquidityTrendChart({ className }: { className?: string }) {
  const data = MOCK_TREND_DATA.liquidity;
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min;

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Liquidity Trend (YTD)</h3>
      <p className="mb-4 text-[12px] text-zinc-500">Monthly total liquidity</p>
      <div className="relative h-48">
        <div className="absolute inset-0 flex items-end">
          {data.map((point, i) => {
            const h = range > 0 ? ((point.value - min) / range) * 160 : 80;
            return (
              <div key={point.date} className="flex flex-1 flex-col items-center justify-end h-full">
                <span className="mb-1 text-[10px] text-zinc-500">{fmt(point.value)}</span>
                <div className="w-full mx-0.5 rounded-t bg-gradient-to-t from-gold/60 to-gold/30 transition-all hover:from-gold/80 hover:to-gold/50"
                  style={{ height: `${Math.max(8, h)}px` }} role="img" aria-label={`${point.label}: ${fmt(point.value)}`} />
                <span className="mt-1 text-[10px] text-zinc-600">{point.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function fmt(v: number): string { return v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(1)}B` : `$${(v / 1_000_000).toFixed(0)}M`; }
