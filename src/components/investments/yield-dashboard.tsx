"use client";

import { memo } from "react";
import { Percent, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { YieldData } from "./investment-types";

interface YieldDashboardProps {
  yields: YieldData[];
  className?: string;
}

function YieldCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/10">
          <div className="h-5 w-5 text-[#d4af37]">{icon}</div>
        </div>
        <div>
          <p className="text-xs text-zinc-500">{label}</p>
          <p className="text-xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TrendBadge({ value, goodUp = true }: { value: number; goodUp?: boolean }) {
  const up = value >= 0;
  const isGood = goodUp ? up : !up;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium", isGood ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-red-500/20 bg-red-500/10 text-red-400")}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {value.toFixed(2)}%
    </span>
  );
}

export const YieldDashboard = memo(function YieldDashboard({ yields, className }: YieldDashboardProps) {
  const portfolioYields = yields.filter((y) => y.portfolioId);
  const holdingYields = yields.filter((y) => y.holdingId);

  const avgCurrentYield = holdingYields.reduce((s, y) => s + (y.currentYield ?? 0), 0) / (holdingYields.length || 1);
  const avgYtm = holdingYields.reduce((s, y) => s + (y.yieldToMaturity ?? 0), 0) / (holdingYields.filter((y) => y.yieldToMaturity).length || 1);
  const avgYtw = holdingYields.reduce((s, y) => s + (y.yieldToWorst ?? 0), 0) / (holdingYields.filter((y) => y.yieldToWorst).length || 1);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-4 gap-3">
        <YieldCard label="Current Yield" value={`${avgCurrentYield.toFixed(2)}%`} icon={<Percent />} />
        <YieldCard label="Yield to Maturity" value={`${avgYtm.toFixed(2)}%`} icon={<Percent />} />
        <YieldCard label="Yield to Worst" value={`${avgYtw.toFixed(2)}%`} icon={<Percent />} />
        {portfolioYields.length > 0 && (
          <YieldCard label="Portfolio Yield" value={`${(portfolioYields.reduce((s, y) => s + (y.portfolioYield ?? 0), 0) / portfolioYields.length).toFixed(2)}%`} icon={<Percent />} />
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Holding/Portfolio</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Current Yield</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">YTM</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">YTW</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Effective Yield</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Annualized</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {yields.map((y) => (
              <tr key={y.id} className="transition-colors hover:bg-zinc-800/40">
                <td className="px-4 py-3 text-sm text-zinc-300">
                  {y.holdingId ? `Holding: ${y.holdingId.slice(0, 12)}...` : `Portfolio: ${y.portfolioId?.slice(0, 12)}...`}
                </td>
                <td className="px-4 py-3 text-right">
                  {y.currentYield != null ? <TrendBadge value={y.currentYield} /> : <span className="text-zinc-600">—</span>}
                </td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">{y.yieldToMaturity != null ? `${y.yieldToMaturity.toFixed(2)}%` : "—"}</td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">{y.yieldToWorst != null ? `${y.yieldToWorst.toFixed(2)}%` : "—"}</td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">{y.effectiveYield != null ? `${y.effectiveYield.toFixed(2)}%` : "—"}</td>
                <td className="px-4 py-3 text-right text-sm text-zinc-300">{y.annualizedYield != null ? `${y.annualizedYield.toFixed(2)}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
