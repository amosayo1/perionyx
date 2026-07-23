"use client";

import { useState, useMemo, memo } from "react";
import { AlertTriangle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnomalyChart } from "./anomaly-chart";
import type { AnomalyDetection, AnomalySeverity } from "./ai-types";

interface AnomalyDashboardProps {
  anomalies: AnomalyDetection[];
  onAcknowledge?: (id: string) => void;
  className?: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "text-red-400 bg-red-500/10 border-red-500/20",
  high: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  low: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

const SEVERITY_BG: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-blue-500",
};

export const AnomalyDashboard = memo(function AnomalyDashboard({
  anomalies, onAcknowledge, className,
}: AnomalyDashboardProps) {
  const [filter, setFilter] = useState<AnomalySeverity | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = [...anomalies];
    if (filter !== "all") result = result.filter(a => a.severity === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.description.toLowerCase().includes(q) ||
        a.metric.toLowerCase().includes(q) ||
        a.entityType.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.severity] - order[b.severity];
    });
  }, [anomalies, filter, search]);

  if (anomalies.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40 py-12", className)}>
        <div className="text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="mt-2 text-sm text-zinc-500">No anomalies detected</p>
        </div>
      </div>
    );
  }

  const unacknowledged = anomalies.filter(a => !a.acknowledged);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          Anomaly Detection Center ({anomalies.length})
          {unacknowledged.length > 0 && (
            <span className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
              {unacknowledged.length} unacknowledged
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search anomalies..."
              className="w-44 rounded-md border border-zinc-800/60 bg-zinc-900/60 py-1.5 pl-8 pr-3 text-xs text-zinc-300 outline-none placeholder:text-zinc-600 focus:border-[#d4af37]/40"
            />
          </div>
          <div className="flex rounded-md border border-zinc-800/60 bg-zinc-900/60 text-xs">
            {(["all", "critical", "high", "medium", "low"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-2 py-1.5 transition-colors",
                  filter === f ? "bg-[#d4af37]/10 text-[#d4af37]" : "text-zinc-500 hover:text-zinc-300",
                  f === "all" && "rounded-l-md",
                  f === "low" && "rounded-r-md"
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnomalyChart anomalies={filtered} />

      <div className="space-y-2">
        {filtered.map(anomaly => (
          <div
            key={anomaly.id}
            className={cn(
              "rounded-lg border transition-colors",
              anomaly.acknowledged ? "border-zinc-800/40 bg-zinc-900/30 opacity-70" : "border-zinc-800/60 bg-zinc-900/40",
              "hover:border-zinc-700/60"
            )}
          >
            <div className="flex items-start gap-3 px-4 py-3">
              <div className={cn("mt-0.5 h-2 w-2 rounded-full flex-shrink-0", SEVERITY_BG[anomaly.severity])} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-medium", anomaly.severity === "critical" ? "text-red-300" : "text-white")}>
                    {anomaly.description}
                  </span>
                  <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider", SEVERITY_COLORS[anomaly.severity])}>
                    {anomaly.severity}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-500">
                  <span>Entity: {anomaly.entityType}/{anomaly.entityId}</span>
                  <span>Metric: {anomaly.metric}</span>
                  <span className={cn(anomaly.variancePercent > 0 ? "text-emerald-400" : "text-red-400")}>
                    Variance: {anomaly.variancePercent > 0 ? "+" : ""}{anomaly.variancePercent.toFixed(1)}%
                  </span>
                  <span>Expected: {anomaly.expectedValue.toLocaleString()} → Actual: {anomaly.actualValue.toLocaleString()}</span>
                </div>
              </div>
              {!anomaly.acknowledged && onAcknowledge && (
                <button
                  onClick={() => onAcknowledge(anomaly.id)}
                  className="rounded-md border border-emerald-500/20 px-2 py-1 text-[11px] font-medium text-emerald-400 transition-colors hover:bg-emerald-500/10"
                >
                  Acknowledge
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
