"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, DollarSign, TrendingUp, TrendingDown, Wallet, AlertTriangle, Calendar } from "lucide-react";
import { MOCK_FUNDING } from "./data";

const PAGE_SIZE = 20;

function fmt(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function priorityBadge(p: "critical" | "high" | "medium" | "low") {
  const styles = {
    critical: "border-red-500/30 text-red-400 bg-red-500/10",
    high: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    medium: "border-blue-500/30 text-blue-400 bg-blue-500/10",
    low: "border-zinc-500/30 text-zinc-400 bg-zinc-500/10",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize", styles[p])}>
      {p}
    </span>
  );
}

function statusBadge(s: "projected" | "committed" | "secured" | "overdue") {
  const styles = {
    projected: "border-blue-500/30 text-blue-400 bg-blue-500/10",
    committed: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    secured: "border-green-500/30 text-green-400 bg-green-500/10",
    overdue: "border-red-500/30 text-red-400 bg-red-500/10",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize", styles[s])}>
      {s}
    </span>
  );
}

function gapColor(pct: number): string {
  if (pct === 0) return "text-green-400";
  if (pct < 10) return "text-amber-400";
  return "text-red-400";
}

export function FutureFundingCenter({ className }: { className?: string }) {
  const [showAll, setShowAll] = useState(false);
  const sorted = [...MOCK_FUNDING].sort((a, b) => a.period.localeCompare(b.period));
  const displayed = showAll ? sorted : sorted.slice(0, PAGE_SIZE);

  const totalRequired = sorted.reduce((s, f) => s + f.fundingRequired, 0);
  const totalAvailable = sorted.reduce((s, f) => s + f.fundingAvailable, 0);
  const totalGap = sorted.reduce((s, f) => s + f.fundingGap, 0);
  const criticalItems = sorted.filter((f) => f.priority === "critical").length;

  const maxReq = Math.max(...sorted.map((f) => f.fundingRequired));

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard icon={DollarSign} label="Total Funding Required" value={fmt(totalRequired)} />
        <SummaryCard icon={Wallet} label="Total Funding Available" value={fmt(totalAvailable)} />
        <SummaryCard icon={AlertTriangle} label="Total Funding Gap" value={fmt(totalGap)} />
        <SummaryCard icon={Calendar} label="Critical Items" value={String(criticalItems)} sub={criticalItems === 1 ? "item" : "items"} />
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="px-3 py-3 text-left font-medium">Period</th>
                <th className="px-3 py-3 text-left font-medium">Entity</th>
                <th className="px-3 py-3 text-left font-medium">Ccy</th>
                <th className="px-3 py-3 text-right font-medium">Required</th>
                <th className="px-3 py-3 text-right font-medium">Available</th>
                <th className="px-3 py-3 text-right font-medium">Gap</th>
                <th className="px-3 py-3 text-right font-medium">Gap %</th>
                <th className="px-3 py-3 text-center font-medium">Source</th>
                <th className="px-3 py-3 text-center font-medium">Priority</th>
                <th className="px-3 py-3 text-right font-medium">Maturity</th>
                <th className="px-3 py-3 text-center font-medium">Status</th>
                <th className="px-3 py-3 text-left font-medium">Gap Bar</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((f) => {
                const reqW = (f.fundingRequired / maxReq) * 100;
                const availW = (f.fundingAvailable / f.fundingRequired) * 100;
                return (
                  <tr key={f.id} className="border-b border-white/[0.03] text-[13px] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5 text-zinc-200">{f.period}</td>
                    <td className="px-3 py-2.5 text-zinc-300">{f.entity}</td>
                    <td className="px-3 py-2.5 text-zinc-400">{f.currency}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-zinc-200">{fmt(f.fundingRequired)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-emerald-400">{fmt(f.fundingAvailable)}</td>
                    <td className={cn("px-3 py-2.5 text-right tabular-nums font-medium", f.fundingGap > 0 ? "text-red-400" : "text-green-400")}>
                      {fmt(f.fundingGap)}
                    </td>
                    <td className={cn("px-3 py-2.5 text-right tabular-nums font-medium", gapColor(f.gapPercent))}>
                      {f.gapPercent}%
                    </td>
                    <td className="px-3 py-2.5 text-center text-zinc-300 text-[12px]">{f.source}</td>
                    <td className="px-3 py-2.5 text-center">{priorityBadge(f.priority)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-zinc-300 text-[12px]">{f.maturityDate}</td>
                    <td className="px-3 py-2.5 text-center">{statusBadge(f.status)}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <div className="relative h-5 w-24 rounded-full bg-zinc-800" role="progressbar" aria-valuenow={availW} aria-valuemin={0} aria-valuemax={100}>
                          <div className="h-full rounded-full bg-emerald-500/60" style={{ width: `${Math.min(100, availW)}%` }} />
                          <div
                            className="absolute inset-0 rounded-full border border-red-500/40"
                            style={{ clipPath: `inset(0 ${100 - Math.min(100, availW)}% 0 0)` }}
                          />
                        </div>
                        <span className="text-[10px] text-zinc-500 w-12 text-right">{Math.round(availW)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!showAll && sorted.length > PAGE_SIZE && (
          <button
            onClick={() => setShowAll(true)}
            className="flex w-full items-center justify-center gap-2 border-t border-white/[0.06] px-4 py-3 text-[13px] text-zinc-400 hover:text-zinc-200 transition-colors"
            aria-label={`Show all ${sorted.length} funding projections`}
          >
            <Eye className="h-4 w-4" />
            View All {sorted.length} Funding Projections
          </button>
        )}
        {showAll && sorted.length > PAGE_SIZE && (
          <button
            onClick={() => setShowAll(false)}
            className="flex w-full items-center justify-center gap-2 border-t border-white/[0.06] px-4 py-3 text-[13px] text-zinc-400 hover:text-zinc-200 transition-colors"
            aria-label="Show fewer funding projections"
          >
            <EyeOff className="h-4 w-4" />
            Show Less
          </button>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3">
      <div className="flex items-center gap-1.5 text-zinc-500">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
      {sub && <p className="text-[11px] text-zinc-500">{sub}</p>}
    </div>
  );
}
