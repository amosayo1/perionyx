"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Filter,
  ChevronDown,
  Shield,
  BarChart3,
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  ArrowUpDown,
} from "lucide-react";
import { MOCK_HEDGES, MOCK_DERIVATIVES } from "./data";
import type { HedgePosition, HedgeType } from "./types";

const GOLD = "#d4af37";

const HEDGE_TYPES: (HedgeType | "all")[] = ["all", "forward", "option", "swap", "natural"];
const ENTITIES = [...new Set(MOCK_HEDGES.map((h) => h.entity))];
const CURRENCIES = [...new Set(MOCK_HEDGES.map((h) => h.currency))];

const typeConfig: Record<HedgeType, { color: string; bg: string }> = {
  forward: { color: "bg-blue-500/20 text-blue-300", bg: "bg-blue-500/10" },
  option: { color: "bg-purple-500/20 text-purple-300", bg: "bg-purple-500/10" },
  swap: { color: "bg-cyan-500/20 text-cyan-300", bg: "bg-cyan-500/10" },
  natural: { color: "bg-emerald-500/20 text-emerald-300", bg: "bg-emerald-500/10" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-emerald-500/20 text-emerald-300" },
  maturing: { label: "Maturing", color: "bg-amber-500/20 text-amber-300" },
  matured: { label: "Matured", color: "bg-zinc-500/20 text-zinc-300" },
  cancelled: { label: "Cancelled", color: "bg-red-500/20 text-red-300" },
};

const derivativePurposeConfig: Record<string, { label: string; color: string }> = {
  hedging: { label: "Hedging", color: "bg-emerald-500/20 text-emerald-300" },
  trading: { label: "Trading", color: "bg-purple-500/20 text-purple-300" },
};

const derivativeStatusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-emerald-500/20 text-emerald-300" },
  exercised: { label: "Exercised", color: "bg-blue-500/20 text-blue-300" },
  expired: { label: "Expired", color: "bg-zinc-500/20 text-zinc-300" },
  cancelled: { label: "Cancelled", color: "bg-red-500/20 text-red-300" },
};

function fmt(v: number): string {
  if (Math.abs(v) >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toFixed(0);
}

export function HedgingPortfolio({ className }: { className?: string }) {
  const [typeFilter, setTypeFilter] = useState<HedgeType | "all">("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);

  const filtered = MOCK_HEDGES.filter((h) => {
    if (typeFilter !== "all" && h.type !== typeFilter) return false;
    if (entityFilter !== "all" && h.entity !== entityFilter) return false;
    if (currencyFilter !== "all" && h.currency !== currencyFilter) return false;
    return true;
  });

  const displayed = showAll ? filtered : filtered.slice(0, 15);
  const totalPositions = filtered.length;

  const summary = {
    totalHedged: filtered.reduce((s, h) => s + h.hedgeAmount, 0),
    totalNotional: filtered.reduce((s, h) => s + h.notionalAmount, 0),
    avgCoverage: filtered.length ? Math.round(filtered.reduce((s, h) => s + h.coveragePercent, 0) / filtered.length) : 0,
    avgEffectiveness: filtered.length ? Math.round(filtered.reduce((s, h) => s + h.effectiveness, 0) / filtered.length) : 0,
    openPositions: filtered.filter((h) => h.status === "active" || h.status === "maturing").length,
  };

  const activeDerivatives = MOCK_DERIVATIVES.filter((d) => d.status === "active");
  const derivSummary = {
    totalNotional: activeDerivatives.reduce((s, d) => s + d.notional, 0),
    count: activeDerivatives.length,
    avgMtmPnl: activeDerivatives.length > 0 ? Math.round(activeDerivatives.reduce((s, d) => s + d.mtmPnl, 0) / activeDerivatives.length) : 0,
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" style={{ color: GOLD }} aria-hidden="true" />
          <h2 className="text-lg font-semibold text-white">Hedging Portfolio</h2>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          <select
            aria-label="Filter by hedge type"
            className="rounded-md border border-white/[0.06] bg-zinc-900 px-2 py-1 text-xs text-zinc-300"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as HedgeType | "all")}
          >
            {HEDGE_TYPES.map((t) => (
              <option key={t} value={t}>{t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <select
            aria-label="Filter by entity"
            className="rounded-md border border-white/[0.06] bg-zinc-900 px-2 py-1 text-xs text-zinc-300"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          >
            <option value="all">All Entities</option>
            {ENTITIES.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <select
            aria-label="Filter by currency"
            className="rounded-md border border-white/[0.06] bg-zinc-900 px-2 py-1 text-xs text-zinc-300"
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
          >
            <option value="all">All Currencies</option>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <SummaryCard icon={Shield} label="Total Hedged" value={`$${fmt(summary.totalHedged)}`} />
        <SummaryCard icon={BarChart3} label="Total Notional" value={`$${fmt(summary.totalNotional)}`} />
        <SummaryCard icon={Activity} label="Avg Coverage" value={`${summary.avgCoverage}%`} color="text-blue-300" />
        <SummaryCard icon={TrendingUp} label="Avg Effectiveness" value={`${summary.avgEffectiveness}%`} color={summary.avgEffectiveness > 85 ? "text-emerald-300" : "text-amber-300"} />
        <SummaryCard icon={Eye} label="Open Positions" value={`${summary.openPositions}`} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/[0.06] bg-zinc-900/50">
        <table className="w-full text-left text-xs" role="table" aria-label="Hedging positions">
          <thead>
            <tr className="border-b border-white/[0.06] text-zinc-500">
              <th className="px-3 py-2 font-medium uppercase tracking-wider">Type</th>
              <th className="px-3 py-2 font-medium uppercase tracking-wider">Instrument</th>
              <th className="px-3 py-2 font-medium uppercase tracking-wider">Entity</th>
              <th className="px-3 py-2 font-medium uppercase tracking-wider">Ccy</th>
              <th className="px-3 py-2 text-right font-medium uppercase tracking-wider">Notional</th>
              <th className="px-3 py-2 text-right font-medium uppercase tracking-wider">Hedge Amt</th>
              <th className="px-3 py-2 text-right font-medium uppercase tracking-wider">Coverage</th>
              <th className="px-3 py-2 text-right font-medium uppercase tracking-wider">Effectiveness</th>
              <th className="px-3 py-2 font-medium uppercase tracking-wider">Maturity</th>
              <th className="px-3 py-2 font-medium uppercase tracking-wider">Counterparty</th>
              <th className="px-3 py-2 font-medium uppercase tracking-wider">Status</th>
              <th className="px-3 py-2 text-right font-medium uppercase tracking-wider">MTM P&L</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((h) => (
              <tr key={h.id} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-3 py-2">
                  <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", typeConfig[h.type].color)}>
                    {h.type}
                  </span>
                </td>
                <td className="px-3 py-2 text-zinc-200">{h.instrument}</td>
                <td className="px-3 py-2 text-zinc-200">{h.entity}</td>
                <td className="px-3 py-2 text-zinc-200">{h.currency}</td>
                <td className="px-3 py-2 text-right text-zinc-200">${fmt(h.notionalAmount)}</td>
                <td className="px-3 py-2 text-right text-zinc-200">${fmt(h.hedgeAmount)}</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <div className="h-1.5 w-12 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          h.coveragePercent >= 80 ? "bg-emerald-500" : h.coveragePercent >= 60 ? "bg-blue-500" : "bg-red-500"
                        )}
                        style={{ width: `${Math.min(100, h.coveragePercent)}%` }}
                        role="progressbar"
                        aria-valuenow={h.coveragePercent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                    <span className={cn(
                      "text-[11px] font-medium",
                      h.coveragePercent >= 80 ? "text-emerald-300" : h.coveragePercent >= 60 ? "text-blue-300" : "text-red-300"
                    )}>
                      {h.coveragePercent}%
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 text-right">
                  <span className={cn(
                    "text-[11px] font-medium",
                    h.effectiveness >= 90 ? "text-emerald-300" : h.effectiveness >= 75 ? "text-blue-300" : "text-red-300"
                  )}>
                    {h.effectiveness}%
                  </span>
                </td>
                <td className="px-3 py-2 text-zinc-200">{h.maturityDate}</td>
                <td className="px-3 py-2 text-zinc-200">{h.counterparty}</td>
                <td className="px-3 py-2">
                  <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", statusConfig[h.status].color)}>
                    {statusConfig[h.status].label}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {h.mtmGainLoss >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-400" aria-hidden="true" />
                    )}
                    <span className={cn("text-xs font-medium", h.mtmGainLoss >= 0 ? "text-emerald-300" : "text-red-300")}>
                      {h.mtmGainLoss >= 0 ? "+" : ""}${fmt(h.mtmGainLoss)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!showAll && totalPositions > 15 && (
        <button
          onClick={() => setShowAll(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-zinc-900/50 px-4 py-2 text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors"
          aria-label={`View all ${totalPositions} positions`}
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          View All {totalPositions} Positions
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}

      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" style={{ color: GOLD }} aria-hidden="true" />
          <h3 className="text-sm font-medium text-white">Derivative Positions Summary</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">Active Positions</p>
            <p className="text-lg font-semibold text-white">{derivSummary.count}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">Total Notional</p>
            <p className="text-lg font-semibold text-white">${fmt(derivSummary.totalNotional)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">Avg MTM P&L</p>
            <p className={cn("text-lg font-semibold", derivSummary.avgMtmPnl >= 0 ? "text-emerald-300" : "text-red-300")}>
              {derivSummary.avgMtmPnl >= 0 ? "+" : ""}${fmt(derivSummary.avgMtmPnl)}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1.5">
            <span>Active Derivatives by Type</span>
          </div>
          <div className="flex gap-3">
            {["forward", "futures", "option", "swap", "ndf"].map((t) => {
              const count = activeDerivatives.filter((d) => d.type === t).length;
              const total = activeDerivatives.length;
              return (
                <div key={t} className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: GOLD }} />
                  <span className="text-[11px] text-zinc-300">{t}: {count}</span>
                  <span className="text-[10px] text-zinc-500">({total > 0 ? Math.round((count / total) * 100) : 0}%)</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs" role="table" aria-label="Derivative positions by purpose and status">
            <thead>
              <tr className="border-b border-white/[0.06] text-zinc-500">
                <th className="px-2 py-1.5 font-medium uppercase tracking-wider">Type</th>
                <th className="px-2 py-1.5 font-medium uppercase tracking-wider">Instrument</th>
                <th className="px-2 py-1.5 text-right font-medium uppercase tracking-wider">Notional</th>
                <th className="px-2 py-1.5 text-right font-medium uppercase tracking-wider">MTM P&L</th>
                <th className="px-2 py-1.5 font-medium uppercase tracking-wider">Purpose</th>
                <th className="px-2 py-1.5 font-medium uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {activeDerivatives.slice(0, 8).map((d) => (
                <tr key={d.id} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-2 py-1.5">
                    <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                      d.type === "forward" ? "bg-blue-500/20 text-blue-300" :
                      d.type === "futures" ? "bg-amber-500/20 text-amber-300" :
                      d.type === "option" ? "bg-purple-500/20 text-purple-300" :
                      d.type === "swap" ? "bg-cyan-500/20 text-cyan-300" :
                      "bg-pink-500/20 text-pink-300"
                    )}>
                      {d.type}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-zinc-200">{d.instrument}</td>
                  <td className="px-2 py-1.5 text-right text-zinc-200">${fmt(d.notional)}</td>
                  <td className="px-2 py-1.5 text-right">
                    <span className={cn("text-[11px]", d.mtmPnl >= 0 ? "text-emerald-300" : "text-red-300")}>
                      {d.mtmPnl >= 0 ? "+" : ""}${fmt(d.mtmPnl)}
                    </span>
                  </td>
                  <td className="px-2 py-1.5">
                    <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium", derivativePurposeConfig[d.purpose]?.color || "text-zinc-300")}>
                      {d.purpose}
                    </span>
                  </td>
                  <td className="px-2 py-1.5">
                    <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium", derivativeStatusConfig[d.status]?.color || "text-zinc-300")}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      </div>
      <p className={cn("mt-1 text-sm font-semibold", color || "text-white")}>{value}</p>
    </div>
  );
}