"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { MOCK_INTEREST_EXPOSURES } from "./data";

interface InterestRateExposureProps {
  className?: string;
}

export function InterestRateExposure({ className }: InterestRateExposureProps) {
  const summary = useMemo(() => {
    let fixed = 0, floating = 0, dur = 0, sens = 0;
    for (const e of MOCK_INTEREST_EXPOSURES) {
      fixed += e.fixedAmount;
      floating += e.floatingAmount;
      dur += e.durationYears;
      sens += e.sensitivityBps;
    }
    const count = MOCK_INTEREST_EXPOSURES.length;
    return {
      totalFixed: fixed,
      totalFloating: floating,
      avgDuration: count > 0 ? dur / count : 0,
      avgSensitivity: count > 0 ? sens / count : 0,
    };
  }, []);

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h3 className="text-sm font-medium text-white">Interest Rate Exposure</h3>
        <p className="text-[12px] text-zinc-500">{MOCK_INTEREST_EXPOSURES.length} positions across {new Set(MOCK_INTEREST_EXPOSURES.map((e) => e.entity)).size} entities</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]" role="table" aria-label="Interest rate exposures">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">Ccy</th>
              <th className="px-4 py-3 text-right font-medium">Fixed ($)</th>
              <th className="px-4 py-3 text-right font-medium">Floating ($)</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 text-right font-medium">Fixed %</th>
              <th className="px-4 py-3 text-right font-medium">Floating %</th>
              <th className="px-4 py-3 text-right font-medium">Duration</th>
              <th className="px-4 py-3 text-right font-medium">Sensitivity</th>
              <th className="px-4 py-3 text-right font-medium">Annual Impact</th>
              <th className="px-4 py-3 text-right font-medium">Policy Limit</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_INTEREST_EXPOSURES.map((ex) => (
              <tr key={ex.id} className="border-b border-white/[0.03] transition-colors hover:bg-zinc-800/30">
                <td className="px-4 py-2.5 text-white">{ex.entity}</td>
                <td className="px-4 py-2.5 font-medium text-zinc-300">{ex.currency}</td>
                <td className="px-4 py-2.5 text-right text-zinc-200">{formatUSD(ex.fixedAmount)}</td>
                <td className="px-4 py-2.5 text-right text-zinc-200">{formatUSD(ex.floatingAmount)}</td>
                <td className="px-4 py-2.5 text-right font-medium text-white">{formatUSD(ex.totalExposure)}</td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-zinc-300">{ex.fixedPercentage.toFixed(0)}%</span>
                    <div className="h-1.5 w-12 rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-blue-500/60"
                        style={{ width: `${ex.fixedPercentage}%` }}
                        role="progressbar"
                        aria-valuenow={ex.fixedPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${ex.fixedPercentage.toFixed(0)}% fixed`}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-zinc-300">{ex.floatingPercentage.toFixed(0)}%</span>
                    <div className="h-1.5 w-12 rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-amber-500/60"
                        style={{ width: `${ex.floatingPercentage}%` }}
                        role="progressbar"
                        aria-valuenow={ex.floatingPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${ex.floatingPercentage.toFixed(0)}% floating`}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className={cn(
                    "font-medium",
                    ex.durationYears > 10 ? "text-red-400" :
                    ex.durationYears > 5 ? "text-amber-400" : "text-zinc-300",
                  )}>
                    {ex.durationYears.toFixed(1)}y
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right text-zinc-300">
                  {formatUSD(ex.sensitivityBps)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className={cn(
                    "font-medium",
                    ex.annualImpact >= 0 ? "text-emerald-400" : "text-red-400",
                  )}>
                    {ex.annualImpact >= 0 ? "+" : ""}{formatUSD(ex.annualImpact)}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right text-zinc-400">{formatUSD(ex.policyLimit)}</td>
                <td className="px-4 py-2.5 text-center">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium",
                    ex.status === "compliant" ? "bg-emerald-500/10 text-emerald-400" :
                    ex.status === "breached" ? "bg-red-500/10 text-red-400" :
                    "bg-amber-500/10 text-amber-400",
                  )}>
                    {ex.status.replace("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/[0.06] bg-zinc-800/50 text-[13px] font-semibold">
              <td colSpan={2} className="px-4 py-3 text-zinc-400">Summary</td>
              <td className="px-4 py-3 text-right text-white">{formatUSD(summary.totalFixed)}</td>
              <td className="px-4 py-3 text-right text-white">{formatUSD(summary.totalFloating)}</td>
              <td className="px-4 py-3 text-right text-white">
                {formatUSD(summary.totalFixed + summary.totalFloating)}
              </td>
              <td colSpan={2} />
              <td className="px-4 py-3 text-right text-zinc-300">{summary.avgDuration.toFixed(1)}y avg</td>
              <td className="px-4 py-3 text-right text-zinc-300">{formatUSD(summary.avgSensitivity)} avg</td>
              <td colSpan={3} />
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
