"use client";

import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import {
  AlertTriangle, ShieldAlert, Clock, Users,
  Filter, Siren, TrendingDown,
} from "lucide-react";
import { MOCK_STRESS_TESTS } from "./data";
import type { StressType } from "./types";

const STRESS_TYPES: StressType[] = [
  "revenue_decline", "expense_increase", "delayed_collections", "bank_failure",
  "currency_crash", "interest_increase", "credit_event", "supply_disruption",
  "payroll_shock", "black_swan",
];

const TYPE_BADGE: Record<string, string> = {
  revenue_decline: "bg-red-500/10 text-red-400 border-red-500/20",
  expense_increase: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  delayed_collections: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  bank_failure: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  currency_crash: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  interest_increase: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  credit_event: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  supply_disruption: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  payroll_shock: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  black_swan: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const SEVERITY_BADGE: Record<string, string> = {
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  high: "bg-red-500/10 text-red-400 border-red-500/20",
  critical: "bg-red-500/15 text-red-300 border-red-500/30",
};

function fmt(v: number): string {
  const abs = Math.abs(v);
  let s: string;
  if (abs >= 1_000_000_000) s = `$${(abs / 1_000_000_000).toFixed(1)}B`;
  else if (abs >= 1_000_000) s = `$${(abs / 1_000_000).toFixed(1)}M`;
  else if (abs >= 1_000) s = `$${(abs / 1_000).toFixed(1)}K`;
  else s = `$${abs.toFixed(0)}`;
  return v < 0 ? `-${s}` : s;
}

function survivalColor(m: number): string {
  if (m >= 12) return "text-emerald-400";
  if (m >= 6) return "text-amber-400";
  if (m >= 3) return "text-red-400";
  return "text-red-300";
}

function survivalBg(m: number): string {
  if (m >= 12) return "bg-emerald-500/15";
  if (m >= 6) return "bg-amber-500/15";
  if (m >= 3) return "bg-red-500/15";
  return "bg-red-500/25";
}

const SEVERITIES = ["all", "low", "medium", "high", "critical"] as const;

export function StressTestingDashboard({ className }: { className?: string }) {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return MOCK_STRESS_TESTS.filter((s) => {
      if (typeFilter !== "all" && s.type !== typeFilter) return false;
      if (severityFilter !== "all" && s.severity !== severityFilter) return false;
      return true;
    });
  }, [typeFilter, severityFilter]);

  const summary = useMemo(() => {
    const total = filtered.length;
    const critical = filtered.filter((s) => s.severity === "critical").length;
    const avgSurvival = total ? filtered.reduce((a, s) => a + s.survivalMonths, 0) / total : 0;
    const worstImpact = filtered.reduce(
      (a, s) => (s.impact < a ? s.impact : a),
      Infinity,
    );
    return { total, critical, avgSurvival, worstImpact };
  }, [filtered]);

  const maxImpact = useMemo(
    () => Math.max(1, ...filtered.map((s) => Math.abs(s.impact))),
    [filtered],
  );

  return (
    <div className={cn("space-y-4", className)} role="region" aria-label="Stress testing dashboard">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/50 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-zinc-500" />
            <select
              aria-label="Filter by stress type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-md border border-white/[0.06] bg-zinc-800/50 px-3 py-1.5 text-[13px] text-white outline-none focus:border-gold/50"
            >
              <option value="all">All Types</option>
              {STRESS_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <select
              aria-label="Filter by severity"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-md border border-white/[0.06] bg-zinc-800/50 px-3 py-1.5 text-[13px] text-white outline-none focus:border-gold/50"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>{s === "all" ? "All Severities" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <ShieldAlert className="h-3.5 w-3.5" />
            Total Tests
          </div>
          <p className="mt-1 text-lg font-semibold text-white">{summary.total}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Siren className="h-3.5 w-3.5 text-red-400" />
            Critical
          </div>
          <p className="mt-1 text-lg font-semibold text-red-400">{summary.critical}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Clock className="h-3.5 w-3.5" />
            Avg Survival
          </div>
          <p className={cn("mt-1 text-lg font-semibold", survivalColor(summary.avgSurvival))}>{summary.avgSurvival.toFixed(1)}mo</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <TrendingDown className="h-3.5 w-3.5" />
            Worst Impact
          </div>
          <p className="mt-1 text-lg font-semibold text-red-400">{fmt(summary.worstImpact)}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((s) => {
          const impactPct = (Math.abs(s.impact) / maxImpact) * 100;
          const survPct = Math.min((s.survivalMonths / 24) * 100, 100);
          return (
            <div
              key={s.id}
              className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4 transition-colors hover:border-white/[0.1]"
              role="article"
              aria-label={`${s.name} stress test`}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-sm font-semibold text-white">{s.name}</h4>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={cn("rounded border px-2 py-0.5 text-[10px] font-medium uppercase", TYPE_BADGE[s.type])}>
                      {s.type.replace(/_/g, " ")}
                    </span>
                    <span className={cn("rounded border px-2 py-0.5 text-[10px] font-medium uppercase", SEVERITY_BADGE[s.severity])}>
                      {s.severity === "critical" && <AlertTriangle className="mr-0.5 inline h-2.5 w-2.5" />}
                      {s.severity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13px]">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Impact</span>
                    <span className="font-medium text-red-400">{fmt(s.impact)}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-zinc-800">
                    <div className="h-1.5 rounded-full bg-red-500/60" style={{ width: `${impactPct}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Impact %</span>
                    <span className="font-medium text-red-400">{s.impactPercent}%</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-zinc-800">
                    <div className="h-1.5 rounded-full bg-red-500/40" style={{ width: `${Math.abs(s.impactPercent)}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Liquidity After</span>
                  <span className="font-medium text-white">{fmt(s.liquidityAfter)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Probability</span>
                  <span className="font-medium text-white">{s.probability}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Survival</span>
                  <span className={cn("inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium", survivalBg(s.survivalMonths), survivalColor(s.survivalMonths))}>
                    <Clock className="h-3 w-3" />
                    {s.survivalMonths} months
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Funding Gap</span>
                  <span className="font-medium text-white">{fmt(s.fundingGap)}</span>
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <span className="text-zinc-500">Recovery Time</span>
                  <span className="font-medium text-white">{s.recoveryTime}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Users className="h-3 w-3 text-zinc-500" />
                {s.affectedEntities.map((e) => (
                  <span key={e} className="rounded bg-zinc-800/50 px-2 py-0.5 text-[10px] text-zinc-400">{e}</span>
                ))}
              </div>

              <div className="mt-2 h-1 rounded-full bg-zinc-800" role="progressbar" aria-label={`Survival months: ${s.survivalMonths} of 24 max`} aria-valuenow={s.survivalMonths} aria-valuemin={0} aria-valuemax={24}>
                <div
                  className={cn(
                    "h-1 rounded-full transition-all",
                    s.survivalMonths >= 12 ? "bg-emerald-500/60" : s.survivalMonths >= 6 ? "bg-amber-500/60" : s.survivalMonths >= 3 ? "bg-red-500/60" : "bg-red-500/80",
                  )}
                  style={{ width: `${survPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
