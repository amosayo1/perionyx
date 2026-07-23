"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DashboardCard } from "./dashboard-card";
import { SparklineChart, TrendLineChart } from "./charts";
import type { KpiData } from "./types";

interface Zone2Props {
  kpis: KpiData[];
  className?: string;
}

function KpiMetric({ kpi, index }: { kpi: KpiData; index: number }) {
  const fmt = (v: number) => {
    if (kpi.format === "currency") {
      const abs = Math.abs(v);
      if (abs >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
      if (abs >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
      if (abs >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
      return `$${v.toLocaleString()}`;
    }
    if (kpi.format === "percent") return `${v.toFixed(1)}%`;
    if (kpi.format === "compact") {
      if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
      if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
      return v.toLocaleString();
    }
    return v.toLocaleString();
  };

  const delta = kpi.previousValue ? ((kpi.value - kpi.previousValue) / kpi.previousValue) * 100 : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 * index, ease: [0, 0, 0.2, 1] }}
      className="group/card rounded-xl border border-zinc-800/60 bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 p-4 shadow-lg transition-all duration-200 hover:border-zinc-700/60 hover:shadow-xl"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">{kpi.label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-white">{fmt(kpi.value)}</p>
          {kpi.subtitle && (
            <p className="mt-0.5 text-[11px] text-zinc-500">{kpi.subtitle}</p>
          )}
        </div>
        {kpi.status && (
          <div
            className={cn(
              "mt-1 h-2 w-2 rounded-full shrink-0",
              kpi.status === "success" && "bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]",
              kpi.status === "warning" && "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]",
              kpi.status === "error" && "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]",
              kpi.status === "neutral" && "bg-zinc-500",
            )}
          />
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {delta !== null && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                delta > 0 && "bg-emerald-500/10 text-emerald-400",
                delta < 0 && "bg-red-500/10 text-red-400",
                delta === 0 && "bg-zinc-500/10 text-zinc-400",
              )}
            >
              {delta > 0 ? "▲" : delta < 0 ? "▼" : "→"} {Math.abs(delta).toFixed(1)}%
            </span>
          )}
          {kpi.trendValue !== undefined && (
            <span className="text-[11px] text-zinc-500">{kpi.trendValue > 0 ? "+" : ""}{kpi.trendValue}</span>
          )}
        </div>
        {kpi.confidence !== undefined && (
          <span className="text-[10px] text-zinc-600">{kpi.confidence}% confidence</span>
        )}
      </div>

      {kpi.sparklineData && kpi.sparklineData.length > 1 && (
        <div className="mt-3">
          <SparklineChart
            data={kpi.sparklineData}
            width={200}
            height={28}
            color={
              kpi.status === "error" ? "#ef4444" :
              kpi.status === "warning" ? "#f59e0b" :
              kpi.status === "success" ? "#22c55e" :
              "#d4a800"
            }
          />
        </div>
      )}

      {kpi.previousValue !== undefined && (
        <p className="mt-1.5 text-[10px] text-zinc-600">
          Previous: {fmt(kpi.previousValue)}
        </p>
      )}

      {kpi.lastUpdated && (
        <p className="mt-1 text-[9px] text-zinc-700">
          As of {kpi.lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {kpi.source && <span> · {kpi.source}</span>}
        </p>
      )}
    </motion.div>
  );
}

export const Zone2ExecutiveKpis = memo(function Zone2ExecutiveKpis({ kpis, className }: Zone2Props) {
  if (kpis.length === 0) {
    return (
      <DashboardCard title="Executive KPIs" isEmpty emptyMessage="No KPI data available yet" size="full" className={className} />
    );
  }

  return (
    <div className={cn("col-span-full", className)}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-white">Executive KPIs</h2>
        <p className="text-[11px] text-zinc-600">Real-time metrics</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi, i) => (
          <KpiMetric key={kpi.label} kpi={kpi} index={i} />
        ))}
      </div>
    </div>
  );
});
