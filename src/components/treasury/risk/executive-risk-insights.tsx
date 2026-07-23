"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { MOCK_INSIGHTS } from "./data";
import type { ExecutiveInsight } from "./types";

type InsightSeverity = ExecutiveInsight["severity"];

const SEVERITY_STYLES: Record<
  InsightSeverity,
  { border: string; icon: string; iconBg: string }
> = {
  positive: {
    border: "border-l-emerald-500",
    icon: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
  },
  warning: {
    border: "border-l-amber-500",
    icon: "text-amber-400",
    iconBg: "bg-amber-500/10",
  },
  critical: {
    border: "border-l-red-500",
    icon: "text-red-400",
    iconBg: "bg-red-500/10",
  },
};

function formatEntityShort(entity: string): string {
  return entity.replace("Perionyx ", "");
}

export function ExecutiveRiskInsights({ className }: { className?: string }) {
  const sorted = useMemo(() => {
    const copy = [...MOCK_INSIGHTS];
    const order: Record<InsightSeverity, number> = {
      critical: 1,
      warning: 2,
      positive: 3,
    };
    const criticalIdx = copy.findIndex(
      (i) =>
        i.label === "Policy Breaches" || i.label === "Liquidity Position"
    );
    if (criticalIdx > 0) {
      const item = copy.splice(criticalIdx, 1)[0];
      copy.unshift(item);
    }
    return copy;
  }, []);

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <BarChart3 className="h-4 w-4 text-zinc-500" />
        <h3 className="text-sm font-medium text-white">Executive Risk Insights</h3>
        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400">
          {MOCK_INSIGHTS.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        {sorted.map((insight, idx) => {
          const styles = SEVERITY_STYLES[insight.severity];
          const isFirst = idx === 0;
          const TrendIcon =
            insight.severity === "positive" ? TrendingUp : TrendingDown;

          return (
            <div
              key={`${insight.label}-${idx}`}
              className={cn(
                "rounded-lg border border-white/[0.06] border-l-2 bg-zinc-800/50 p-4 transition-colors hover:bg-zinc-800/80",
                styles.border,
                isFirst && "sm:col-span-2"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full",
                      styles.iconBg
                    )}
                  >
                    <TrendIcon className={cn("h-4 w-4", styles.icon)} />
                  </div>
                  <span className="text-[12px] font-medium uppercase tracking-wider text-zinc-500">
                    {insight.label}
                  </span>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                    insight.severity === "positive" &&
                      "bg-emerald-500/15 text-emerald-300",
                    insight.severity === "warning" &&
                      "bg-amber-500/15 text-amber-300",
                    insight.severity === "critical" &&
                      "bg-red-500/15 text-red-300"
                  )}
                >
                  {insight.severity}
                </span>
              </div>

              <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
                {insight.value}
              </p>

              <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">
                {insight.description}
              </p>

              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500">
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {formatEntityShort(insight.entity)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
