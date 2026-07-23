"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MOCK_COUNTRY_RISK } from "./data";

interface CountryRiskMapProps {
  className?: string;
}

export function CountryRiskMap({ className }: CountryRiskMapProps) {
  const sorted = useMemo(
    () => [...MOCK_COUNTRY_RISK].sort((a, b) => b.compositeScore - a.compositeScore),
    [],
  );

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h3 className="text-sm font-medium text-white">Country Risk Assessment</h3>
        <p className="text-[12px] text-zinc-500">{sorted.length} countries — sorted by composite score (highest risk first)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]" role="table" aria-label="Country risk assessment">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Country</th>
              <th className="px-4 py-3 font-medium">Region</th>
              <th className="px-4 py-3 text-right font-medium">Exposure ($)</th>
              <th className="px-4 py-3 text-center font-medium">Political</th>
              <th className="px-4 py-3 text-center font-medium">Economic</th>
              <th className="px-4 py-3 text-center font-medium">Currency</th>
              <th className="px-4 py-3 text-center font-medium">Composite</th>
              <th className="px-4 py-3 text-center font-medium">Risk Level</th>
              <th className="px-4 py-3 text-center font-medium">Trend</th>
              <th className="px-4 py-3 text-right font-medium">Limit ($)</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const compositeColor = c.compositeScore > 70 ? "text-red-400" :
                c.compositeScore > 50 ? "text-amber-400" :
                c.compositeScore > 30 ? "text-blue-400" : "text-emerald-400";

              return (
                <tr key={c.id} className="border-b border-white/[0.03] transition-colors hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 font-medium text-white">{c.country}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{c.region}</td>
                  <td className="px-4 py-2.5 text-right text-zinc-200">{formatUSD(c.exposure)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-zinc-300">{c.politicalRisk}</span>
                      <div className="h-1.5 w-12 rounded-full bg-zinc-800">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            c.politicalRisk > 60 ? "bg-red-500/60" :
                            c.politicalRisk > 30 ? "bg-amber-500/60" : "bg-emerald-500/60",
                          )}
                          style={{ width: `${c.politicalRisk}%` }}
                          role="progressbar"
                          aria-valuenow={c.politicalRisk}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Political risk ${c.politicalRisk}`}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-zinc-300">{c.economicRisk}</span>
                      <div className="h-1.5 w-12 rounded-full bg-zinc-800">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            c.economicRisk > 60 ? "bg-red-500/60" :
                            c.economicRisk > 30 ? "bg-amber-500/60" : "bg-emerald-500/60",
                          )}
                          style={{ width: `${c.economicRisk}%` }}
                          role="progressbar"
                          aria-valuenow={c.economicRisk}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Economic risk ${c.economicRisk}`}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-zinc-300">{c.currencyRisk}</span>
                      <div className="h-1.5 w-12 rounded-full bg-zinc-800">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            c.currencyRisk > 60 ? "bg-red-500/60" :
                            c.currencyRisk > 30 ? "bg-amber-500/60" : "bg-emerald-500/60",
                          )}
                          style={{ width: `${c.currencyRisk}%` }}
                          role="progressbar"
                          aria-valuenow={c.currencyRisk}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Currency risk ${c.currencyRisk}`}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={cn("text-sm font-bold", compositeColor)}>
                      {c.compositeScore}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                      c.riskLevel === "low" ? "bg-emerald-500/10 text-emerald-400" :
                      c.riskLevel === "medium" ? "bg-amber-500/10 text-amber-400" :
                      c.riskLevel === "high" ? "bg-red-500/10 text-red-400" :
                      "bg-red-500/20 text-red-400",
                    )}>
                      {c.riskLevel === "critical" && <AlertTriangle className="h-3 w-3" aria-hidden="true" />}
                      {c.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex justify-center">
                      {c.trend === "improving" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                          <TrendingUp className="h-3 w-3" aria-hidden="true" />
                          Improving
                        </span>
                      ) : c.trend === "deteriorating" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-400">
                          <TrendingDown className="h-3 w-3" aria-hidden="true" />
                          Deteriorating
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400">
                          <Minus className="h-3 w-3" aria-hidden="true" />
                          Stable
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right text-zinc-400">{formatUSD(c.limits)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatUSD(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}
