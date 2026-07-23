"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { MOCK_INSIGHTS } from "./data";
import type { ExecutiveInsight } from "./types";

const SEVERITY_BORDER: Record<string, string> = {
  positive: "border-emerald-500/40",
  warning: "border-amber-500/40",
  critical: "border-red-500/40",
};

const SEVERITY_GLOW: Record<string, string> = {
  positive: "shadow-[inset_0_0_0_1px_rgba(52,211,153,0.1)]",
  warning: "shadow-[inset_0_0_0_1px_rgba(251,191,36,0.1)]",
  critical: "shadow-[inset_0_0_0_1px_rgba(239,68,68,0.1)]",
};

function InsightCard({
  insight,
  fullWidth,
}: {
  insight: ExecutiveInsight;
  fullWidth?: boolean;
}) {
  const isUp =
    insight.severity === "positive";
  const TrendIcon = isUp ? TrendingUp : TrendingDown;

  return (
    <div
      className={cn(
        "bg-zinc-900/50 border border-white/[0.06] rounded-lg p-5 transition-all hover:bg-zinc-900/40",
        fullWidth && "col-span-full",
        SEVERITY_GLOW[insight.severity]
      )}
      style={{
        borderLeftColor: SEVERITY_BORDER[insight.severity].replace("border-", ""),
        borderLeftWidth: 3,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-zinc-500 uppercase tracking-wider">
          {insight.label}
        </span>
        <TrendIcon
          className={cn(
            "w-4 h-4",
            insight.severity === "positive" && "text-emerald-400",
            insight.severity === "warning" && "text-amber-400",
            insight.severity === "critical" && "text-red-400"
          )}
        />
      </div>

      <div className="text-2xl font-bold text-white mb-1">{insight.value}</div>

      <p className="text-xs text-zinc-400 leading-relaxed">{insight.description}</p>

      <div className="mt-3 flex items-center gap-2">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            insight.severity === "positive" && "bg-emerald-500",
            insight.severity === "warning" && "bg-amber-500",
            insight.severity === "critical" && "bg-red-500"
          )}
        />
        <span className="text-xs text-zinc-500">{insight.entity}</span>
      </div>
    </div>
  );
}

export function ExecutiveCashForecastInsights() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Executive Insights</h2>
        <span className="text-sm text-zinc-400">{MOCK_INSIGHTS.length} insights</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_INSIGHTS.map((insight, i) => (
          <InsightCard key={`${insight.label}-${i}`} insight={insight} fullWidth={i === 0} />
        ))}
      </div>
    </div>
  );
}