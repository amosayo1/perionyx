"use client";

import { memo } from "react";
import { DollarSign, Percent, ShieldCheck, AlertTriangle, FileText, CreditCard, Lightbulb, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaxRecommendation, TaxAlert } from "./tax-types";

interface ExecutiveInsightsProps {
  totalLiability: number;
  effectiveRate: number;
  complianceScore: number;
  atRiskCount: number;
  returnsDue: number;
  paymentsDue: number;
  topRecommendations: TaxRecommendation[];
  criticalAlerts: TaxAlert[];
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: "text-red-400 border-red-500/20 bg-red-500/10",
  warning: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  info: "text-blue-400 border-blue-500/20 bg-blue-500/10",
};

export const ExecutiveInsights = memo(function ExecutiveInsights({
  totalLiability, effectiveRate, complianceScore, atRiskCount,
  returnsDue, paymentsDue, topRecommendations, criticalAlerts,
  className,
}: ExecutiveInsightsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-gold/20 bg-gold/10">
              <DollarSign className="h-4 w-4 text-gold" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-500">Total Liability</p>
              <p className="text-lg font-bold text-white">{formatCurrency(totalLiability)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-emerald-500/20 bg-emerald-500/10">
              <Percent className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-500">Effective Rate</p>
              <p className="text-lg font-bold text-white">{effectiveRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2">
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-md border", complianceScore >= 80 ? "border-emerald-500/20 bg-emerald-500/10" : "border-amber-500/20 bg-amber-500/10")}>
              <ShieldCheck className={cn("h-4 w-4", complianceScore >= 80 ? "text-emerald-400" : "text-amber-400")} />
            </div>
            <div>
              <p className="text-[11px] text-zinc-500">Compliance Score</p>
              <p className="text-lg font-bold text-white">{complianceScore}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-xs text-zinc-400">At Risk</span>
          </div>
          <p className="mt-1 text-xl font-bold text-red-400">{atRiskCount}</p>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-400" />
            <span className="text-xs text-zinc-400">Returns Due</span>
          </div>
          <p className="mt-1 text-xl font-bold text-amber-400">{returnsDue}</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-zinc-400">Payments Due</span>
          </div>
          <p className="mt-1 text-xl font-bold text-blue-400">{paymentsDue}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <Lightbulb className="h-3.5 w-3.5" />
            Recommendations
          </h3>
          {topRecommendations.length === 0 ? (
            <p className="text-xs text-zinc-600">No recommendations</p>
          ) : (
            <div className="space-y-1.5">
              {topRecommendations.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-md border border-zinc-800/40 px-2.5 py-1.5">
                  <span className="truncate text-xs text-zinc-300">{r.title}</span>
                  <span className="shrink-0 text-[10px] text-zinc-500">{r.confidence}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <AlertOctagon className="h-3.5 w-3.5" />
            Critical Alerts
          </h3>
          {criticalAlerts.length === 0 ? (
            <p className="text-xs text-zinc-600">No critical alerts</p>
          ) : (
            <div className="space-y-1.5">
              {criticalAlerts.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-md border border-red-500/20 px-2.5 py-1.5">
                  <span className="truncate text-xs text-zinc-300">{a.title}</span>
                  <span className={cn("shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-medium", SEVERITY_STYLES[a.severity])}>
                    {a.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
