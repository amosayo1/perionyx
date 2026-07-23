"use client";

import { cn } from "@/lib/utils";
import { PieChart, TrendingUp, TrendingDown } from "lucide-react";
import { MOCK_LIQUIDITY_COMPOSITION } from "./data";

export function LiquidityCompositionCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-white">Liquidity Composition</h3>
          <p className="text-[12px] text-zinc-500">By category</p>
        </div>
        <PieChart className="h-4 w-4 text-zinc-500" />
      </div>
      <div className="space-y-2">
        {MOCK_LIQUIDITY_COMPOSITION.map((item) => (
          <div key={item.category}>
            <div className="flex items-center justify-between text-[13px] mb-1">
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", item.color.replace("text-", "bg-").replace("-400", "-500"))} />
                <span className="text-zinc-300">{item.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{fmt(item.amount)}</span>
                <span className="text-zinc-500 w-10 text-right">{item.percentage.toFixed(1)}%</span>
                {item.trend === "up" ? <TrendingUp className="h-3 w-3 text-emerald-400" /> : item.trend === "down" ? <TrendingDown className="h-3 w-3 text-red-400" /> : <span className="h-3 w-3 rounded-full border border-zinc-500" />}
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-800">
              <div className={cn("h-full rounded-full", item.color.replace("text-", "bg-").replace("-400", "-500/70"))}
                style={{ width: `${item.percentage}%` }} role="progressbar" aria-valuenow={item.percentage} aria-valuemin={0} aria-valuemax={100} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function fmt(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  return `$${(v / 1_000_000).toFixed(0)}M`;
}
