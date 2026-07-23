"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { MOCK_FORECAST_PERIODS } from "./data";

export function LiquidityForecastTimeline({ compact, className }: { compact?: boolean; className?: string }) {
  const periods = compact ? MOCK_FORECAST_PERIODS.slice(0, 3) : MOCK_FORECAST_PERIODS;

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h3 className="text-sm font-medium text-white">Liquidity Forecast</h3>
        <p className="text-[12px] text-zinc-500">Projected liquidity across forecast horizons</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]" role="table" aria-label="Liquidity forecast">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-3 font-medium">Horizon</th>
              <th className="px-5 py-3 text-right font-medium">Opening</th>
              <th className="px-5 py-3 text-right font-medium">Inflows</th>
              <th className="px-5 py-3 text-right font-medium">Outflows</th>
              <th className="px-5 py-3 text-right font-medium">Closing</th>
              <th className="px-5 py-3 text-right font-medium">Buffer</th>
              <th className="px-5 py-3 text-right font-medium">Surplus</th>
              <th className="px-5 py-3 text-right font-medium">Confidence</th>
              <th className="px-5 py-3 text-right font-medium">Risk</th>
            </tr>
          </thead>
          <tbody>
            {periods.map((p, i) => (
              <tr key={p.horizon} className={cn("border-b border-white/[0.03] transition-colors hover:bg-zinc-800/30", i === 0 && "bg-zinc-800/20")}>
                <td className="px-5 py-3 font-medium text-white">{p.horizon}</td>
                <td className="px-5 py-3 text-right text-zinc-300">{fmt(p.openingBalance)}</td>
                <td className="px-5 py-3 text-right text-emerald-400">+{fmt(p.expectedInflows)}</td>
                <td className="px-5 py-3 text-right text-red-400">-{fmt(Math.abs(p.expectedOutflows))}</td>
                <td className="px-5 py-3 text-right font-semibold text-white">{fmt(p.closingBalance)}</td>
                <td className="px-5 py-3 text-right text-zinc-300">{fmt(p.minimumBuffer)}</td>
                <td className={cn("px-5 py-3 text-right font-medium", p.deficit > 0 ? "text-red-400" : "text-emerald-400")}>
                  {p.deficit > 0 ? `-${fmt(p.deficit)}` : fmt(p.surplus)}
                </td>
                <td className="px-5 py-3 text-right">
                  <span className={cn(p.confidence >= 80 ? "text-emerald-400" : p.confidence >= 60 ? "text-amber-400" : "text-red-400")}>
                    {p.confidence}%
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  {p.risk === "high" ? (
                    <AlertTriangle className="ml-auto h-4 w-4 text-red-400" />
                  ) : p.risk === "medium" ? (
                    <AlertTriangle className="ml-auto h-4 w-4 text-amber-400" />
                  ) : (
                    <span className="text-emerald-400 text-[11px]">Low</span>
                  )}
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
