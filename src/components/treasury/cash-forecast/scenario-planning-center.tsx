"use client";

import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import {
  Filter, Layers, TrendingUp, AlertTriangle,
  Gauge, CalendarDays, Target, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { MOCK_SCENARIOS, MOCK_ENTITIES } from "./data";
import type { ScenarioType } from "./types";

const SCENARIO_TYPES: ScenarioType[] = [
  "base", "optimistic", "pessimistic", "expansion", "recession", "acquisition",
  "capital_raise", "fx_shock", "interest_shock", "supply_chain",
  "customer_default", "pandemic", "custom",
];

const TYPE_BADGE: Record<string, string> = {
  base: "bg-[#c9a84c]/10 text-[#c9a84c] border-[#c9a84c]/20",
  optimistic: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pessimistic: "bg-red-500/10 text-red-400 border-red-500/20",
  expansion: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  recession: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  acquisition: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  capital_raise: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  fx_shock: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  interest_shock: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  supply_chain: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  customer_default: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  pandemic: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  custom: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const RISK_BADGE: Record<string, string> = {
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

function fmtMonths(v: number): string {
  if (v >= 12) return `${(v / 12).toFixed(1)}yr`;
  return `${v}mo`;
}

export function ScenarioPlanningCenter({ className }: { className?: string }) {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return MOCK_SCENARIOS.filter((s) => {
      if (typeFilter !== "all" && s.type !== typeFilter) return false;
      if (entityFilter !== "all" && s.entity !== entityFilter) return false;
      return true;
    });
  }, [typeFilter, entityFilter]);

  const summary = useMemo(() => {
    const total = filtered.length;
    const avgProb = total ? Math.round(filtered.reduce((a, s) => a + s.probability, 0) / total) : 0;
    const totalImpact = filtered.reduce((a, s) => a + s.impact, 0);
    const highestRisk = filtered.reduce((a, s) => {
      const order = { critical: 4, high: 3, medium: 2, low: 1 };
      return order[s.risk] > order[a.risk] ? s : a;
    }, filtered[0]);
    return { total, avgProb, totalImpact, highestRisk };
  }, [filtered]);

  return (
    <div className={cn("space-y-4", className)} role="region" aria-label="Scenario planning center">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/50 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-zinc-500" />
            <select
              aria-label="Filter by scenario type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-md border border-white/[0.06] bg-zinc-800/50 px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#c9a84c]/50"
            >
              <option value="all">All Types</option>
              {SCENARIO_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <select
              aria-label="Filter by entity"
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="rounded-md border border-white/[0.06] bg-zinc-800/50 px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#c9a84c]/50"
            >
              <option value="all">All Entities</option>
              {MOCK_ENTITIES.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Layers className="h-3.5 w-3.5" />
            Total Scenarios
          </div>
          <p className="mt-1 text-lg font-semibold text-white">{summary.total}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Target className="h-3.5 w-3.5" />
            Avg Probability
          </div>
          <p className="mt-1 text-lg font-semibold text-white">{summary.avgProb}%</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <TrendingUp className="h-3.5 w-3.5" />
            Total Impact
          </div>
          <p className={cn("mt-1 text-lg font-semibold", summary.totalImpact >= 0 ? "text-emerald-400" : "text-red-400")}>{fmt(summary.totalImpact)}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <AlertTriangle className="h-3.5 w-3.5" />
            Highest Risk
          </div>
          <p className="mt-1 text-lg font-semibold text-white truncate" title={summary.highestRisk?.name}>{summary.highestRisk?.name ?? "—"}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((s) => (
          <div
            key={s.id}
            className={cn(
              "rounded-lg border bg-zinc-900/50 p-4 transition-colors hover:border-white/[0.1]",
              s.type === "base" ? "border-[#c9a84c]/40" : "border-white/[0.06]",
            )}
            role="article"
            aria-label={`${s.name} scenario`}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-white">{s.name}</h4>
                <p className="mt-0.5 text-[12px] text-zinc-500 line-clamp-1">{s.description}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <span className={cn("rounded border px-2 py-0.5 text-[10px] font-medium uppercase", TYPE_BADGE[s.type])}>
                  {s.type.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Probability</span>
                <span className="font-medium text-white">{s.probability}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Impact</span>
                <span className={cn("font-medium", s.impact >= 0 ? "text-emerald-400" : "text-red-400")}>{fmt(s.impact)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Upside</span>
                <span className="flex items-center gap-1 font-medium text-emerald-400"><ArrowUpRight className="h-3 w-3" />{fmt(s.upside)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Downside</span>
                <span className="flex items-center gap-1 font-medium text-red-400"><ArrowDownRight className="h-3 w-3" />{fmt(s.downside)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Projected Cash</span>
                <span className="font-medium text-white">{fmt(s.projectedCash)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Liquidity</span>
                <div className="flex items-center gap-1.5">
                  <Gauge className={cn("h-3 w-3", s.liquidityScore >= 70 ? "text-emerald-400" : s.liquidityScore >= 40 ? "text-amber-400" : "text-red-400")} />
                  <span className="font-medium text-white">{s.liquidityScore}/100</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Funding Gap</span>
                <span className="font-medium text-white">{fmt(s.fundingGap)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Cash Runway</span>
                <span className="flex items-center gap-1 font-medium text-white"><CalendarDays className="h-3 w-3" />{fmtMonths(s.cashRunway)}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("rounded border px-2 py-0.5 text-[10px] font-medium uppercase", RISK_BADGE[s.risk])}>
                {s.risk === "critical" && <AlertTriangle className="mr-0.5 inline h-2.5 w-2.5" />}
                {s.risk}
              </span>
              {s.assumptions.slice(0, 2).map((a, i) => (
                <span key={i} className="rounded bg-zinc-800/50 px-2 py-0.5 text-[10px] text-zinc-400">{a}</span>
              ))}
              {s.assumptions.length > 2 && (
                <span className="text-[10px] text-zinc-600">+{s.assumptions.length - 2} more</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
