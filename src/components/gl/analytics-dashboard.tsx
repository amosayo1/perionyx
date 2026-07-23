"use client";

import { useState, useMemo, memo } from "react";
import { TrendingUp, TrendingDown, Minus, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GLAnalyticsKPI } from "./gl-types";

interface AnalyticsDashboardProps {
  kpis: GLAnalyticsKPI[];
  className?: string;
}

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "financial", label: "Financial" },
  { value: "liquidity", label: "Liquidity" },
  { value: "efficiency", label: "Efficiency" },
  { value: "risk", label: "Risk" },
  { value: "compliance", label: "Compliance" },
  { value: "coverage", label: "Coverage" },
];

const STATUS_DOT: Record<string, string> = {
  good: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-red-500",
};

const STATUS_BORDER: Record<string, string> = {
  good: "border-emerald-500/20",
  warning: "border-amber-500/20",
  critical: "border-red-500/20",
};

const CATEGORY_LABELS: Record<string, string> = {
  financial: "Financial",
  liquidity: "Liquidity",
  efficiency: "Efficiency",
  risk: "Risk",
  compliance: "Compliance",
  coverage: "Coverage",
};

function TrendArrow({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-emerald-400" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-400" />;
  return <Minus className="h-4 w-4 text-zinc-400" />;
}

function formatKpiValue(value: number, unit: string): string {
  if (unit === "%") return `${value.toFixed(1)}%`;
  if (unit === "currency" || unit === "USD") {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toLocaleString()}`;
  }
  if (unit === "days") return `${value.toFixed(0)}d`;
  return `${value}${unit}`;
}

export const AnalyticsDashboard = memo(function AnalyticsDashboard({ kpis, className }: AnalyticsDashboardProps) {
  const [category, setCategory] = useState("");

  const filtered = useMemo(() => {
    if (!category) return kpis;
    return kpis.filter((k) => k.category === category);
  }, [kpis, category]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-zinc-500" />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="appearance-none rounded-md border border-zinc-700/50 bg-zinc-800/60 px-3 py-1.5 text-sm text-zinc-300 focus:border-[#d4af37]/40 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/30"
        >
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {filtered.map((kpi) => {
          const pctOfTarget = kpi.target > 0 ? (kpi.value / kpi.target) * 100 : 0;
          return (
            <div
              key={kpi.name}
              className={cn("rounded-lg border bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-900/60", STATUS_BORDER[kpi.status])}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", STATUS_DOT[kpi.status])} />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                      {CATEGORY_LABELS[kpi.category] ?? kpi.category}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-zinc-300">{kpi.name}</p>
                </div>
                <TrendArrow trend={kpi.trend} />
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{formatKpiValue(kpi.value, kpi.unit)}</span>
                <span className="text-xs text-zinc-500">/ {formatKpiValue(kpi.target, kpi.unit)}</span>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Progress</span>
                  <span>{pctOfTarget.toFixed(0)}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-700">
                  <div
                    className={cn("h-full rounded-full transition-all", kpi.status === "good" ? "bg-emerald-500" : kpi.status === "warning" ? "bg-amber-500" : "bg-red-500")}
                    style={{ width: `${Math.min(pctOfTarget, 100)}%` }}
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-600">
                <span>Previous: {formatKpiValue(kpi.previousValue, kpi.unit)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-zinc-500">No KPIs found for this category</p>
        </div>
      )}
    </div>
  );
});
