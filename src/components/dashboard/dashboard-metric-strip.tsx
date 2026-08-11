"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Minus, Circle, Database, RefreshCw, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardKpi, DataMode } from "@/modules/dashboard";

const STATUS_STYLES: Record<DashboardKpi["status"], { dot: string; label: string; text: string }> = {
  healthy: { dot: "bg-emerald-400", label: "text-emerald-400", text: "Healthy" },
  warning: { dot: "bg-amber-400", label: "text-amber-400", text: "Warning" },
  critical: { dot: "bg-red-400", label: "text-red-400", text: "Critical" },
};

function MetricCard({ kpi }: { kpi: DashboardKpi }) {
  const status = STATUS_STYLES[kpi.status];
  const deltaValue = kpi.delta === null ? 0 : Number(kpi.delta.replace(/[^\d.-]/g, "")) || 0;
  const isGood = deltaValue === 0 ? null : (kpi.deltaIsGood ? deltaValue >= 0 : deltaValue < 0);
  const DeltaIcon =
    deltaValue === 0 ? Minus : isGood ? ArrowUpRight : ArrowDownRight;
  const deltaClass =
    isGood === null ? "text-zinc-500" : isGood ? "text-emerald-400" : "text-red-400";

  return (
    <Link
      href={kpi.drillTarget}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30 p-4 transition-all duration-200",
        "hover:border-white/[0.12] hover:bg-white/[0.02]",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
          {kpi.label}
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-full", status.dot)} />
          <span className="sr-only">{status.text}</span>
        </span>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-[26px] font-bold leading-[32px] tracking-[-0.02em] text-white tabular-nums">
          {kpi.value}
        </span>
        {kpi.delta !== null && (
          <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums", deltaClass)}>
            <DeltaIcon className="h-3 w-3" />
            {kpi.delta}
          </span>
        )}
      </div>

      <p className="mt-0.5 text-[11px] text-zinc-600">{kpi.basis}</p>

      <div className="mt-auto pt-3 text-[10px] text-zinc-600">
        {kpi.source} ·{" "}
        {kpi.updatedAt
          ? new Date(kpi.updatedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
          : "not synced"}
      </div>

      <span className="pointer-events-none absolute bottom-2 right-2 inline-flex items-center gap-0.5 text-[10px] font-medium text-gold opacity-0 transition-opacity group-hover:opacity-100">
        Open
        <ChevronRight className="h-3 w-3" />
      </span>
    </Link>
  );
}

interface DashboardMetricStripProps {
  metrics: DashboardKpi[];
  dataMode: DataMode;
  className?: string;
}

export const DashboardMetricStrip = memo(function DashboardMetricStrip({
  metrics,
  dataMode,
  className,
}: DashboardMetricStripProps) {
  if (!metrics.length) {
    return (
      <div className={cn("rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-5", className)}>
        <p className="text-[13px] text-zinc-500">No financial metrics available yet.</p>
      </div>
    );
  }

  return (
    <section aria-labelledby="dashboard-metrics" className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <h2 id="dashboard-metrics" className="text-sm font-semibold text-zinc-300">
          Financial State
        </h2>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
            dataMode === "live"
              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
              : "border-amber-500/20 bg-amber-500/5 text-amber-400",
          )}
        >
          {dataMode === "live" ? (
            <Database className="h-3 w-3" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          {dataMode === "live" ? "Live" : "Seeded"}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((kpi) => (
          <MetricCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </section>
  );
});
