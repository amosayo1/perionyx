"use client";

import { memo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExchangeRateReference } from "./gl-types";

interface FXRevaluationCenterProps {
  rates: ExchangeRateReference[];
  revaluationEntries: { id: string; accountName: string; currency: string; originalAmount: number; revaluedAmount: number; gainLoss: number; }[];
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const RATE_TYPE_COLORS: Record<string, string> = {
  historical: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
  spot: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  average: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  closing: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
};

export const FXRevaluationCenter = memo(function FXRevaluationCenter({ rates, revaluationEntries, className }: FXRevaluationCenterProps) {
  const totalGainLoss = revaluationEntries.reduce((sum, e) => sum + e.gainLoss, 0);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-center">
          <p className="text-[11px] text-zinc-500">Active Rates</p>
          <p className="text-2xl font-bold text-blue-400">{rates.length}</p>
        </div>
        <div className={cn("rounded-lg border p-3 text-center", totalGainLoss >= 0 ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5")}>
          <p className="text-[11px] text-zinc-500">Net FX Gain/Loss</p>
          <p className={cn("text-2xl font-bold", totalGainLoss >= 0 ? "text-emerald-400" : "text-red-400")}>
            {formatCurrency(Math.abs(totalGainLoss))}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40">
        <div className="border-b border-zinc-800/60 px-4 py-3">
          <h3 className="text-sm font-semibold text-zinc-300">Exchange Rates</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">From</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">To</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Rate</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Type</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {rates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500">No rates available</td>
                </tr>
              ) : (
                rates.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-zinc-800/40">
                    <td className="px-4 py-3 text-sm font-mono text-white">{r.fromCurrency}</td>
                    <td className="px-4 py-3 text-sm font-mono text-white">{r.toCurrency}</td>
                    <td className="px-4 py-3 text-right text-sm font-mono text-gold">{r.rate.toFixed(6)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize", RATE_TYPE_COLORS[r.rateType] ?? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>
                        {r.rateType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-zinc-500">{formatDate(r.date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40">
        <div className="border-b border-zinc-800/60 px-4 py-3">
          <h3 className="text-sm font-semibold text-zinc-300">Revaluation Results</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Account</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Currency</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Original</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Revalued</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Gain/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {revaluationEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500">No revaluation entries</td>
                </tr>
              ) : (
                revaluationEntries.map((e) => (
                  <tr key={e.id} className="transition-colors hover:bg-zinc-800/40">
                    <td className="px-4 py-3 text-sm text-white">{e.accountName}</td>
                    <td className="px-4 py-3 text-center text-sm font-mono text-zinc-400">{e.currency}</td>
                    <td className="px-4 py-3 text-right text-sm font-mono text-zinc-400">{formatCurrency(e.originalAmount)}</td>
                    <td className="px-4 py-3 text-right text-sm font-mono text-white">{formatCurrency(e.revaluedAmount)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {e.gainLoss >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span className={cn("text-sm font-mono font-medium", e.gainLoss >= 0 ? "text-emerald-400" : "text-red-400")}>
                          {formatCurrency(Math.abs(e.gainLoss))}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});
