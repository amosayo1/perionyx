"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { RiskKPIItem } from "./risk-types";

interface KPIChartProps {
  kpis: RiskKPIItem[];
}

function formatKPIValue(value: number, unit: string): string {
  if (unit === "%") return `${value.toFixed(1)}%`;
  if (unit === "hours") return `${value.toFixed(0)}h`;
  if (unit === "score") return value.toFixed(1);
  return value.toLocaleString();
}

const COLORS: Record<string, { text: string; bar: string; bg: string }> = {
  good: { text: "text-emerald-400", bar: "bg-emerald-500", bg: "bg-emerald-500/20" },
  warning: { text: "text-amber-400", bar: "bg-amber-500", bg: "bg-amber-500/20" },
  critical: { text: "text-red-400", bar: "bg-red-500", bg: "bg-red-500/20" },
};

function KPIEntry({ kpi }: { kpi: RiskKPIItem }) {
  const c = COLORS[kpi.status];
  const pct = kpi.target > 0 ? Math.min((kpi.value / kpi.target) * 100, 100) : 0;
  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm text-zinc-400">{kpi.name}</span>
        <span className={cn("text-lg font-bold", c.text)}>{formatKPIValue(kpi.value, kpi.unit)}</span>
      </div>
      <div className="relative h-2 rounded-full bg-zinc-800">
        <div className={cn("h-full rounded-full transition-all", c.bar)} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-xs text-zinc-600">
        <span>Prev: {formatKPIValue(kpi.previousValue, kpi.unit)}</span>
        <span>Target: {formatKPIValue(kpi.target, kpi.unit)}</span>
        <span className={cn(kpi.trend === "up" ? "text-emerald-400" : kpi.trend === "down" ? "text-red-400" : "text-zinc-500")}>
          {kpi.trend === "up" ? "↑" : kpi.trend === "down" ? "↓" : "→"}
        </span>
      </div>
    </div>
  );
}

export const KPIChart = memo(function KPIChart({ kpis }: KPIChartProps) {
  if (kpis.length === 0) {
    return <p className="py-8 text-center text-sm text-zinc-500">No KPIs available</p>;
  }
  return (
    <div className="space-y-2">
      {kpis.map((kpi, i) => (
        <KPIEntry key={`${kpi.name}-${i}`} kpi={kpi} />
      ))}
    </div>
  );
});
