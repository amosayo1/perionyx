"use client";

import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { MOCK_INSIGHTS } from "./data";

const SEVERITY_COLORS: Record<string, string> = {
  positive: "border-l-emerald-500",
  warning: "border-l-amber-500",
  critical: "border-l-red-500",
};

const SEVERITY_BG: Record<string, string> = {
  positive: "bg-emerald-500/5",
  warning: "bg-amber-500/5",
  critical: "bg-red-500/5",
};

export function ExecutiveBankAccountInsights({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Executive Insights</h3>
      <p className="mb-4 text-[12px] text-zinc-500">Key observations for Group Treasurer &amp; CFO</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2" role="list" aria-label="Executive insights">
        {MOCK_INSIGHTS.map((insight, i) => {
          const isFirst = i === 0;
          return (
            <div
              key={insight.label}
              role="listitem"
              className={cn(
                "rounded-lg border border-white/[0.06] border-l-2 p-4 transition-colors hover:bg-zinc-800/20",
                SEVERITY_COLORS[insight.severity],
                isFirst && "md:col-span-2",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-2xl font-bold text-white">
                    {insight.value}
                  </p>
                  <p className="mt-0.5 text-[12px] font-medium text-zinc-400">{insight.label}</p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-500">{insight.description}</p>
                  <p className="mt-2 text-[11px] text-zinc-500">{insight.entity}</p>
                </div>
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    SEVERITY_BG[insight.severity],
                  )}
                >
                  {insight.severity === "positive" ? (
                    <TrendingUp className="h-4 w-4 text-emerald-400" aria-hidden />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" aria-hidden />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
