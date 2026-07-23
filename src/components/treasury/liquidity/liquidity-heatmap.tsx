"use client";

import { cn } from "@/lib/utils";
import { MOCK_ENTITY_LIQUIDITY } from "./data";

export function LiquidityHeatmap({ className }: { className?: string }) {
  const cols = ["Entity", "Liquidity Score", "Coverage Days", "Cash Burn", "Status"];
  const statusColor = (s: string) => s === "healthy" ? "bg-emerald-500/20 text-emerald-300" : s === "watch" ? "bg-amber-500/20 text-amber-300" : "bg-red-500/20 text-red-300";
  const scoreBg = (s: number) => s >= 80 ? "bg-emerald-500/15 text-emerald-300" : s >= 60 ? "bg-amber-500/15 text-amber-300" : "bg-red-500/15 text-red-300";
  const daysColor = (d: number) => d >= 180 ? "text-emerald-300" : d >= 90 ? "text-amber-300" : "text-red-300";

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h3 className="text-sm font-medium text-white">Liquidity Heatmap</h3>
        <p className="text-[12px] text-zinc-500">Entity-level liquidity health — green: healthy, amber: watch, red: critical</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]" role="table" aria-label="Liquidity heatmap">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              {cols.map((c) => <th key={c} className="px-4 py-3 font-medium">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {MOCK_ENTITY_LIQUIDITY.map((e) => (
              <tr key={e.entity} className="border-b border-white/[0.03] transition-colors hover:bg-zinc-800/20">
                <td className="px-4 py-3 text-white text-[12px]">{e.entity}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-block rounded px-2 py-0.5 text-[12px] font-medium", scoreBg(e.liquidityScore))}>
                    {e.liquidityScore}
                  </span>
                </td>
                <td className={cn("px-4 py-3 font-medium", daysColor(e.coverageDays))}>{e.coverageDays}d</td>
                <td className="px-4 py-3 text-zinc-300">{fmt(e.cashBurn)}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium", statusColor(e.status))}>
                    {e.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function fmt(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  return `$${(v / 1_000_000).toFixed(0)}M`;
}
