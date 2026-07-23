"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MOCK_FX_EXPOSURES } from "./data";

interface FXExposureTableProps {
  className?: string;
}

export function FXExposureTable({ className }: FXExposureTableProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_FX_EXPOSURES;
    const q = search.toLowerCase();
    return MOCK_FX_EXPOSURES.filter(
      (e) => e.currency.toLowerCase().includes(q) || e.entity.toLowerCase().includes(q),
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const item of filtered) {
      const key = item.currency;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return map;
  }, [filtered]);

  const totals = useMemo(() => {
    let long = 0, short = 0, net = 0;
    for (const e of filtered) {
      long += e.longAmount;
      short += e.shortAmount;
      net += e.netExposure;
    }
    return { long, short, net };
  }, [filtered]);

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div>
          <h3 className="text-sm font-medium text-white">FX Exposure</h3>
          <p className="text-[12px] text-zinc-500">{filtered.length} exposures across {grouped.size} currencies</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search currency, entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 rounded-md border border-white/[0.06] bg-zinc-800 py-1.5 pl-8 pr-3 text-[13px] text-white placeholder-zinc-500 outline-none focus:border-zinc-600"
            aria-label="Search exposures"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]" role="table" aria-label="FX exposures">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-3 font-medium">Currency</th>
              <th className="px-5 py-3 text-right font-medium">Long ($)</th>
              <th className="px-5 py-3 text-right font-medium">Short ($)</th>
              <th className="px-5 py-3 text-right font-medium">Net ($)</th>
              <th className="px-5 py-3 text-right font-medium">Functional</th>
              <th className="px-5 py-3 text-right font-medium">Reporting</th>
              <th className="px-5 py-3 text-right font-medium">Gain/Loss</th>
              <th className="px-5 py-3 text-right font-medium">Hedge %</th>
              <th className="px-5 py-3 text-center font-medium">Policy</th>
              <th className="px-5 py-3 text-center font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(grouped.entries()).map(([currency, items]) => {
              const groupLong = items.reduce((s, i) => s + i.longAmount, 0);
              const groupShort = items.reduce((s, i) => s + i.shortAmount, 0);
              const groupNet = items.reduce((s, i) => s + i.netExposure, 0);
              return (
                <tr key={currency} className="border-b border-white/[0.03] bg-zinc-800/30">
                  <td className="px-5 py-2.5 font-medium text-white" colSpan={10}>
                    <span className="text-xs font-semibold tracking-wider text-zinc-400">{currency}</span>
                  </td>
                </tr>
              );
            })}
            {Array.from(grouped.entries()).map(([currency, items]) =>
              items.map((ex) => (
                <tr key={ex.id} className="border-b border-white/[0.03] transition-colors hover:bg-zinc-800/30">
                  <td className="px-5 py-2.5 pl-8 text-white">{ex.currency}</td>
                  <td className="px-5 py-2.5 text-right text-zinc-200">{formatUSD(ex.longAmount)}</td>
                  <td className="px-5 py-2.5 text-right text-zinc-200">{formatUSD(ex.shortAmount)}</td>
                  <td className="px-5 py-2.5 text-right">
                    <span className={cn(
                      "font-medium",
                      ex.netExposure > 0 ? "text-emerald-400" : ex.netExposure < 0 ? "text-red-400" : "text-zinc-400",
                    )}>
                      {ex.netExposure >= 0 ? "+" : ""}{formatUSD(ex.netExposure)}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-right text-zinc-400">{ex.functionalCurrency}</td>
                  <td className="px-5 py-2.5 text-right text-zinc-400">{ex.reportingCurrency}</td>
                  <td className="px-5 py-2.5 text-right">
                    <span className={cn(
                      ex.gainLoss >= 0 ? "text-emerald-400" : "text-red-400",
                    )}>
                      {ex.gainLoss >= 0 ? "+" : ""}{formatUSD(ex.gainLoss)}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-zinc-300">{ex.hedgePercentage}%</span>
                      <div className="h-1.5 w-16 rounded-full bg-zinc-800">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            ex.hedgePercentage >= 50 ? "bg-emerald-500/60" :
                            ex.hedgePercentage >= 25 ? "bg-amber-500/60" : "bg-red-500/60",
                          )}
                          style={{ width: `${ex.hedgePercentage}%` }}
                          role="progressbar"
                          aria-valuenow={ex.hedgePercentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${ex.hedgePercentage}% hedged`}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-2.5 text-center">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-medium",
                      ex.policyStatus === "compliant" ? "bg-emerald-500/10 text-emerald-400" :
                      ex.policyStatus === "breached" ? "bg-red-500/10 text-red-400" :
                      "bg-amber-500/10 text-amber-400",
                    )}>
                      {ex.policyStatus.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-center">
                    <div className="flex justify-center">
                      {ex.trend === "up" ? (
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-400" aria-label="Up" />
                      ) : ex.trend === "down" ? (
                        <TrendingDown className="h-3.5 w-3.5 text-red-400" aria-label="Down" />
                      ) : (
                        <Minus className="h-3.5 w-3.5 text-zinc-500" aria-label="Stable" />
                      )}
                    </div>
                  </td>
                </tr>
              )),
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/[0.06] bg-zinc-800/50 text-[13px] font-semibold">
              <td className="px-5 py-3 text-zinc-400">Total ({filtered.length} exposures)</td>
              <td className="px-5 py-3 text-right text-white">{formatUSD(totals.long)}</td>
              <td className="px-5 py-3 text-right text-white">{formatUSD(totals.short)}</td>
              <td className="px-5 py-3 text-right">
                <span className={cn(
                  totals.net >= 0 ? "text-emerald-400" : "text-red-400",
                )}>
                  {totals.net >= 0 ? "+" : ""}{formatUSD(totals.net)}
                </span>
              </td>
              <td colSpan={6} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function formatUSD(value: number): string {
  const abs = Math.abs(value);
  let formatted: string;
  if (abs >= 1_000_000_000) formatted = `$${(value / 1_000_000_000).toFixed(1)}B`;
  else if (abs >= 1_000_000) formatted = `$${(value / 1_000_000).toFixed(1)}M`;
  else if (abs >= 1_000) formatted = `$${(value / 1_000).toFixed(1)}K`;
  else formatted = `$${value.toFixed(0)}`;
  return formatted;
}
