"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, ShieldCheck, Eye } from "lucide-react";
import { MOCK_COUNTERPARTY_RISK } from "./data";

interface CounterpartyRiskGridProps {
  className?: string;
}

export function CounterpartyRiskGrid({ className }: CounterpartyRiskGridProps) {
  const summary = useMemo(() => {
    let totalExposure = 0, totalUtilization = 0, criticalCount = 0;
    for (const c of MOCK_COUNTERPARTY_RISK) {
      totalExposure += c.exposure;
      totalUtilization += c.utilization;
      if (c.health === "critical") criticalCount++;
    }
    const avgUtil = MOCK_COUNTERPARTY_RISK.length > 0
      ? totalUtilization / MOCK_COUNTERPARTY_RISK.length
      : 0;
    return { totalExposure, avgUtilization: avgUtil, criticalCount };
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">Counterparty Risk</h3>
          <p className="text-[12px] text-zinc-500">{MOCK_COUNTERPARTY_RISK.length} counterparties monitored</p>
        </div>
        <div className="flex items-center gap-4 text-[12px]">
          <div className="text-right">
            <span className="text-zinc-500">Total Exposure</span>
            <p className="font-semibold text-white">{formatUSD(summary.totalExposure)}</p>
          </div>
          <div className="text-right">
            <span className="text-zinc-500">Avg Utilization</span>
            <p className="font-semibold text-zinc-300">{summary.avgUtilization.toFixed(1)}%</p>
          </div>
          <div className="text-right">
            <span className="text-zinc-500">Critical</span>
            <p className={cn("font-semibold", summary.criticalCount > 0 ? "text-red-400" : "text-zinc-300")}>
              {summary.criticalCount}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {MOCK_COUNTERPARTY_RISK.map((item) => {
          const utilColor = item.utilization > 90 ? "bg-red-500" : item.utilization > 70 ? "bg-amber-500" : "bg-emerald-500";
          const scoreColor = item.riskScore < 30 ? "text-emerald-400" : item.riskScore < 60 ? "text-amber-400" : "text-red-400";

          return (
            <div
              key={item.id}
              className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{item.counterparty}</p>
                  <p className="text-[12px] text-zinc-500">{item.country}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium",
                    item.creditRating === "AA+" ? "bg-emerald-500/10 text-emerald-400" :
                    item.creditRating.startsWith("AA") ? "bg-blue-500/10 text-blue-400" :
                    item.creditRating.startsWith("A") ? "bg-amber-500/10 text-amber-400" :
                    "bg-zinc-500/10 text-zinc-400",
                  )}>
                    {item.creditRating}
                  </span>
                  <div className="flex items-center gap-1">
                    {item.health === "healthy" ? (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-[11px] font-medium text-emerald-400">Healthy</span>
                      </>
                    ) : item.health === "watch" ? (
                      <>
                        <Eye className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-[11px] font-medium text-amber-400">Watch</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                        <span className="text-[11px] font-medium text-red-400">Critical</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-[12px]">
                <div>
                  <span className="text-zinc-500">Exposure</span>
                  <p className="font-medium text-white">{formatUSD(item.exposure)}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Limit</span>
                  <p className="font-medium text-white">{formatUSD(item.limit)}</p>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-zinc-500">Utilization</span>
                  <span className="font-medium text-zinc-300">{item.utilization.toFixed(0)}%</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800">
                  <div
                    className={cn("h-full rounded-full transition-all", utilColor)}
                    style={{ width: `${item.utilization}%` }}
                    role="progressbar"
                    aria-valuenow={item.utilization}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${item.utilization.toFixed(0)}% utilized`}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <span className="text-[12px] text-zinc-500">Risk Score</span>
                  <p className={cn("text-sm font-semibold", scoreColor)}>{item.riskScore}/100</p>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-zinc-500">
                  <span>Collateral: {formatUSD(item.collateralHeld)}</span>
                  <span className="text-zinc-600">|</span>
                  <span>Netting: {item.nettingEligible ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          );
        })}
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
