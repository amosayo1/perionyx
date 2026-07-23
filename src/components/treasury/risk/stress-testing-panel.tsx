"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Clock,
  Building2,
  Gauge,
  DollarSign,
  BarChart3,
  Filter,
  Search,
  Zap,
} from "lucide-react";
import { MOCK_STRESS_SCENARIOS } from "./data";
import type { StressScenario, StressCategory, RiskSeverity } from "./types";

const GOLD = "#c9a84c";

const STRESS_TYPES: (StressCategory | "all")[] = [
  "all", "fx_shock", "interest_shock", "liquidity_crisis", "bank_failure",
  "country_sanctions", "commodity_spike", "revenue_decline", "customer_default",
  "supply_disruption", "pandemic",
];

const typeLabels: Record<StressCategory, string> = {
  fx_shock: "FX Shock",
  interest_shock: "Interest Shock",
  liquidity_crisis: "Liquidity Crisis",
  bank_failure: "Bank Failure",
  country_sanctions: "Country Sanctions",
  commodity_spike: "Commodity Spike",
  revenue_decline: "Revenue Decline",
  customer_default: "Customer Default",
  supply_disruption: "Supply Disruption",
  pandemic: "Pandemic",
};

const severityConfig: Record<RiskSeverity, { label: string; color: string; icon: React.ElementType | null }> = {
  low: { label: "Low", color: "bg-emerald-500/20 text-emerald-300", icon: null },
  medium: { label: "Medium", color: "bg-amber-500/20 text-amber-300", icon: null },
  high: { label: "High", color: "bg-red-500/20 text-red-300", icon: null },
  critical: { label: "Critical", color: "bg-red-500/30 text-red-200", icon: AlertCircle },
};

function fmt(v: number): string {
  if (Math.abs(v) >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toFixed(0);
}

export function StressTestingPanel({ className }: { className?: string }) {
  const [typeFilter, setTypeFilter] = useState<StressCategory | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<RiskSeverity | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = MOCK_STRESS_SCENARIOS.filter((s: StressScenario) => {
    if (typeFilter !== "all" && s.type !== typeFilter) return false;
    if (severityFilter !== "all" && s.severity !== severityFilter) return false;
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const maxImpact = Math.max(...filtered.map((s: StressScenario) => s.impact), 1);

  const summary = {
    total: filtered.length,
    critical: filtered.filter((s: StressScenario) => s.severity === "critical").length,
    avgImpact: filtered.length ? Math.round(filtered.reduce((a: number, s: StressScenario) => a + s.impact, 0) / filtered.length) : 0,
    worstCase: filtered.length ? Math.max(...filtered.map((s: StressScenario) => s.impact)) : 0,
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5" style={{ color: GOLD }} aria-hidden="true" />
          <h2 className="text-lg font-semibold text-white">Stress Testing</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search scenarios..."
              aria-label="Search stress scenarios"
              className="rounded-md border border-white/[0.06] bg-zinc-900 pl-7 pr-2 py-1 text-xs text-zinc-300 placeholder:text-zinc-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            aria-label="Filter by stress type"
            className="rounded-md border border-white/[0.06] bg-zinc-900 px-2 py-1 text-xs text-zinc-300"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as StressCategory | "all")}
          >
            <option value="all">All Types</option>
            {STRESS_TYPES.slice(1).map((t) => (
              <option key={t} value={t}>{typeLabels[t as StressCategory]}</option>
            ))}
          </select>
          <select
            aria-label="Filter by severity"
            className="rounded-md border border-white/[0.06] bg-zinc-900 px-2 py-1 text-xs text-zinc-300"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as RiskSeverity | "all")}
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3">
          <p className="text-[11px] uppercase tracking-wider text-zinc-500">Total Scenarios</p>
          <p className="mt-1 text-lg font-semibold text-white">{summary.total}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3">
          <p className="text-[11px] uppercase tracking-wider text-zinc-500">Critical</p>
          <p className="mt-1 text-lg font-semibold text-red-300">{summary.critical}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3">
          <p className="text-[11px] uppercase tracking-wider text-zinc-500">Avg Impact</p>
          <p className="mt-1 text-lg font-semibold text-white">${fmt(summary.avgImpact)}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3">
          <p className="text-[11px] uppercase tracking-wider text-zinc-500">Worst Case</p>
          <p className="mt-1 text-lg font-semibold text-red-300">${fmt(summary.worstCase)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((s: StressScenario) => {
          const SeverityIcon = severityConfig[s.severity].icon;
          return (
            <div
              key={s.id}
              className={cn(
                "rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700",
                s.covenantBreach && "border-red-500/30"
              )}
              role="article"
              aria-label={`Stress scenario: ${s.name}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-white">{s.name}</h3>
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", severityConfig[s.severity].color)}>
                    {SeverityIcon && <SeverityIcon className="h-3 w-3" aria-hidden="true" />}
                    {severityConfig[s.severity].label}
                  </span>
                </div>
                <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                  {typeLabels[s.type]}
                </span>
              </div>

              <p className="mt-1 line-clamp-1 text-[11px] text-zinc-500">{s.description}</p>

              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="flex items-center gap-1.5">
                  <Gauge className="h-3 w-3 text-zinc-500" aria-hidden="true" />
                  <span className="text-[11px] text-zinc-400">Probability:</span>
                  <span className="text-[11px] font-medium text-zinc-200">{s.probability}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3 w-3 text-zinc-500" aria-hidden="true" />
                  <span className="text-[11px] text-zinc-400">Impact:</span>
                  <span className="text-[11px] font-medium text-red-300">${fmt(s.impact)} ({s.impactPercent}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="h-3 w-3 text-zinc-500" aria-hidden="true" />
                  <span className="text-[11px] text-zinc-400">Cash:</span>
                  <span className="text-[11px] font-medium text-zinc-200">${fmt(s.cashImpact)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="h-3 w-3 text-zinc-500" aria-hidden="true" />
                  <span className="text-[11px] text-zinc-400">EBITDA:</span>
                  <span className="text-[11px] font-medium text-zinc-200">${fmt(s.ebitdaImpact)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="h-3 w-3 text-zinc-500" aria-hidden="true" />
                  <span className="text-[11px] text-zinc-400">Liquidity:</span>
                  <span className="text-[11px] font-medium text-zinc-200">${fmt(s.liquidityImpact)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3 text-zinc-500" aria-hidden="true" />
                  <span className="text-[11px] text-zinc-400">Debt:</span>
                  <span className="text-[11px] font-medium text-zinc-200">${fmt(s.debtImpact)}</span>
                </div>
              </div>

              <div className="mt-2 rounded-md bg-zinc-800/50 p-2">
                <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                  <span>Impact Magnitude</span>
                  <span>${fmt(s.impact)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      s.severity === "critical" ? "bg-red-500" : s.severity === "high" ? "bg-orange-500" : s.severity === "medium" ? "bg-amber-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${(s.impact / maxImpact) * 100}%` }}
                    role="progressbar"
                    aria-valuenow={s.impact}
                    aria-valuemin={0}
                    aria-valuemax={maxImpact}
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-3">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-zinc-500" aria-hidden="true" />
                  <span className="text-[10px] text-zinc-500">Survival:</span>
                  <span className={cn(
                    "text-[10px] font-medium",
                    s.survivalMonths >= 12 ? "text-emerald-300" : s.survivalMonths >= 6 ? "text-amber-300" : s.survivalMonths >= 3 ? "text-red-300" : "text-red-400"
                  )}>
                    {s.survivalMonths}m
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-zinc-500" aria-hidden="true" />
                  <span className="text-[10px] text-zinc-400">Recovery:</span>
                  <span className="text-[10px] font-medium text-zinc-200">{s.recoveryTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className={cn("h-3 w-3", s.covenantBreach ? "text-red-400" : "text-emerald-400")} aria-hidden="true" />
                  <span className="text-[10px] text-zinc-400">Covenant:</span>
                  <span className={cn("text-[10px] font-medium", s.covenantBreach ? "text-red-300" : "text-emerald-300")}>
                    {s.covenantBreach ? "Breach" : "Safe"}
                  </span>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-1">
                <Building2 className="h-3 w-3 text-zinc-500" aria-hidden="true" />
                <span className="text-[10px] text-zinc-500">Affected:</span>
                <div className="flex flex-wrap gap-1">
                  {s.affectedEntities.map((e) => (
                    <span key={e} className="inline-flex items-center rounded-full bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-400">{e}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}