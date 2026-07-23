"use client";

import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { WorkflowMetric } from "./types";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface WorkflowAnalyticsProps {
  data: WorkflowMetric[];
  className?: string;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

export const WorkflowAnalytics = memo(function WorkflowAnalytics({
  data,
  className,
}: WorkflowAnalyticsProps) {
  const { totalFailed, totalCompleted, overallSuccessRate, sortedData } = useMemo(() => {
    const totalFailed = data.reduce((s, d) => s + d.failed, 0);
    const totalCompleted = data.reduce((s, d) => s + d.completed, 0);
    const totalTotal = totalFailed + totalCompleted;
    const overallSuccessRate = totalTotal > 0 ? (totalCompleted / totalTotal) * 100 : 100;
    const sortedData = [...data].sort((a, b) => b.total - a.total);
    return { totalFailed, totalCompleted, overallSuccessRate, sortedData };
  }, [data]);

  if (!data.length) {
    return (
      <div className={cn("flex items-center justify-center text-xs text-zinc-600 rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30 p-6", className)}>
        No workflow data available
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30 p-5", className)}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Workflow Performance</h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            {totalCompleted} completed · {totalFailed} failed
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-zinc-800/50 px-3 py-1.5">
          <Activity className="h-3.5 w-3.5 text-zinc-400" />
          <span className={cn("text-xs font-medium", overallSuccessRate >= 95 ? "text-emerald-400" : overallSuccessRate >= 80 ? "text-amber-400" : "text-red-400")}>
            {overallSuccessRate.toFixed(1)}% success
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {sortedData.map((wf) => {
          const successRate = wf.completed + wf.failed > 0 ? (wf.completed / (wf.completed + wf.failed)) * 100 : 100;
          const barPct = wf.total / Math.max(...sortedData.map((x) => x.total));

          return (
            <div key={wf.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-zinc-300 truncate">{wf.name}</span>
                  {wf.trend && (
                    wf.trend.direction === "up" ? (
                      <TrendingUp className="h-3 w-3 text-emerald-500/70 shrink-0" />
                    ) : wf.trend.direction === "down" ? (
                      <TrendingDown className="h-3 w-3 text-red-500/70 shrink-0" />
                    ) : null
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] shrink-0">
                  <span className="text-zinc-500">{formatDuration(wf.avgDurationMs)}</span>
                  <span className={cn("font-medium", successRate >= 95 ? "text-emerald-400" : successRate >= 80 ? "text-amber-400" : "text-red-400")}>
                    {successRate.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="relative h-1.5 rounded-full bg-zinc-800/60 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-emerald-500/50 transition-all"
                  style={{ width: `${Math.min((wf.completed / wf.total) * 100, 100)}%` }}
                />
                <div
                  className="absolute inset-y-0 rounded-full bg-red-500/50 transition-all"
                  style={{ left: `${(wf.completed / wf.total) * 100}%`, width: `${Math.min((wf.failed / wf.total) * 100, 100 - (wf.completed / wf.total) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
