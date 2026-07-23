"use client";

import { memo } from "react";
import { Lightbulb, AlertOctagon, TrendingUp, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GLRecommendation, GLAlert } from "./gl-types";

interface ExecutiveInsightsProps {
  recommendations: GLRecommendation[];
  criticalAlerts: GLAlert[];
  totalJournals?: number;
  postedJournals?: number;
  openPeriods?: number;
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
  recommendations, criticalAlerts, totalJournals, postedJournals, openPeriods, className,
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
              <p className="text-[11px] text-zinc-500">Total Journals</p>
              <p className="text-lg font-bold text-white">{totalJournals?.toLocaleString() ?? "—"}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-emerald-500/20 bg-emerald-500/10">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-500">Posted Journals</p>
              <p className="text-lg font-bold text-white">{postedJournals?.toLocaleString() ?? "—"}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-amber-500/20 bg-amber-500/10">
              <CalendarSvg className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-500">Open Periods</p>
              <p className="text-lg font-bold text-white">{openPeriods?.toLocaleString() ?? "—"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <Lightbulb className="h-3.5 w-3.5" />
            Recommendations ({recommendations.filter((r) => !r.implemented).length})
          </h3>
          {recommendations.filter((r) => !r.implemented).length === 0 ? (
            <p className="text-xs text-zinc-600">All recommendations implemented</p>
          ) : (
            <div className="space-y-1.5">
              {recommendations.filter((r) => !r.implemented).slice(0, 3).map((r) => (
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

function CalendarSvg({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
