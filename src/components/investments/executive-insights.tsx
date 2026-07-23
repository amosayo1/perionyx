"use client";

import { memo } from "react";
import { Lightbulb, AlertOctagon, TrendingUp, DollarSign, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

interface ExecutiveInsightsProps {
  totalMarketValue: number;
  portfolioReturn: number;
  portfolioYield: number;
  diversificationScore: number;
  riskMetrics: { label: string; value: number; variant: "low" | "medium" | "high" }[];
  recommendations: { title: string; detail: string; impact: "high" | "medium" | "low" }[];
  className?: string;
}

const SEVERITY_STYLES: Record<string, string> = {
  high: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  medium: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  low: "border-blue-500/20 bg-blue-500/10 text-blue-400",
};

const RISK_COLORS: Record<string, string> = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-red-400",
};

export const ExecutiveInsights = memo(function ExecutiveInsights({
  totalMarketValue, portfolioReturn, portfolioYield, diversificationScore,
  riskMetrics, recommendations, className,
}: ExecutiveInsightsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#d4af37]/20 bg-[#d4af37]/10">
              <DollarSign className="h-4 w-4 text-[#d4af37]" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-500">Total Market Value</p>
              <p className="text-lg font-bold text-white">{formatCurrency(totalMarketValue)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-emerald-500/20 bg-emerald-500/10">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-500">Portfolio Return</p>
              <p className={cn("text-lg font-bold", portfolioReturn >= 0 ? "text-emerald-400" : "text-red-400")}>
                {portfolioReturn >= 0 ? "+" : ""}{portfolioReturn.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2">
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-md border", diversificationScore >= 70 ? "border-emerald-500/20 bg-emerald-500/10" : "border-amber-500/20 bg-amber-500/10")}>
              <ShieldCheck className={cn("h-4 w-4", diversificationScore >= 70 ? "text-emerald-400" : "text-amber-400")} />
            </div>
            <div>
              <p className="text-[11px] text-zinc-500">Diversification</p>
              <p className="text-lg font-bold text-white">{diversificationScore}/100</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <Lightbulb className="h-3.5 w-3.5" />
            Recommendations
          </h3>
          {recommendations.length === 0 ? (
            <p className="py-4 text-center text-xs text-zinc-600">No recommendations</p>
          ) : (
            <div className="space-y-1.5">
              {recommendations.map((r, i) => (
                <div key={i} className="rounded-md border border-zinc-800/40 px-2.5 py-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-300">{r.title}</span>
                    <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-medium", SEVERITY_STYLES[r.impact])}>
                      {r.impact}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-600">{r.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <AlertOctagon className="h-3.5 w-3.5" />
            Risk Overview
          </h3>
          <div className="space-y-1.5">
            {riskMetrics.map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border border-zinc-800/40 px-2.5 py-1.5">
                <span className="text-xs text-zinc-300">{r.label}</span>
                <span className={cn("text-xs font-medium", RISK_COLORS[r.variant])}>
                  {r.value.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
