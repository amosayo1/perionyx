"use client";

import { memo } from "react";
import { FileText, Brain, Lightbulb, AlertTriangle, TrendingUp, CheckCircle, XCircle, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExecutiveSummary as ExecutiveSummaryType } from "./ai-types";
import { HealthScoreChart } from "./health-score-chart";

interface ExecutiveSummaryProps {
  summary: ExecutiveSummaryType;
  className?: string;
}

function computeHealthScore(status: string): number {
  return status === "good" ? 85 : status === "warning" ? 60 : 30;
}

export const ExecutiveSummaryComponent = memo(function ExecutiveSummaryComponent({ summary, className }: ExecutiveSummaryProps) {
  const healthScore = computeHealthScore(summary.overallHealth);

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
            <FileText className="h-4 w-4 text-[#d4af37]" />
            Executive Summary
          </h2>
          <p className="mt-1 text-[11px] text-zinc-500">
            Period: {summary.period} · Generated {new Date(summary.generatedAt).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit"
            })}
          </p>
        </div>
        <HealthScoreChart score={healthScore} size={80} />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{summary.summary}</p>

      <div className="mt-4 grid grid-cols-5 gap-3">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3 text-center">
          <Brain className="mx-auto h-4 w-4 text-[#d4af37]" />
          <p className="mt-1 text-lg font-bold text-white">{summary.keyInsights.length}</p>
          <p className="text-[10px] text-zinc-500">Key Insights</p>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3 text-center">
          <Lightbulb className="mx-auto h-4 w-4 text-amber-400" />
          <p className="mt-1 text-lg font-bold text-white">{summary.topRecommendations.length}</p>
          <p className="text-[10px] text-zinc-500">Recommendations</p>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3 text-center">
          <AlertTriangle className="mx-auto h-4 w-4 text-red-400" />
          <p className="mt-1 text-lg font-bold text-white">{summary.criticalAnomalies.length}</p>
          <p className="text-[10px] text-zinc-500">Critical Anomalies</p>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3 text-center">
          <TrendingUp className="mx-auto h-4 w-4 text-blue-400" />
          <p className="mt-1 text-lg font-bold text-white">{summary.forecasts.length}</p>
          <p className="text-[10px] text-zinc-500">Forecasts</p>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3 text-center">
          {summary.overallHealth === "good" ? (
            <CheckCircle className="mx-auto h-4 w-4 text-emerald-400" />
          ) : summary.overallHealth === "warning" ? (
            <AlertTriangle className="mx-auto h-4 w-4 text-amber-400" />
          ) : (
            <XCircle className="mx-auto h-4 w-4 text-red-400" />
          )}
          <p className="mt-1 text-lg font-bold text-white capitalize">{summary.overallHealth}</p>
          <p className="text-[10px] text-zinc-500">Overall Health</p>
        </div>
      </div>
    </div>
  );
});
