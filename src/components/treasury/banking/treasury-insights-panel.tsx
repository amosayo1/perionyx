"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, Lightbulb, TrendingUp, Activity } from "lucide-react";
import type { TreasuryInsight } from "@/server/banking/workspace";

const typeConfig = {
  RISK: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
  OPPORTUNITY: { icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ALERT: { icon: Activity, color: "text-amber-400", bg: "bg-amber-500/10" },
  RECOMMENDATION: { icon: Lightbulb, color: "text-blue-400", bg: "bg-blue-500/10" },
};

const severityBorder = {
  CRITICAL: "border-l-red-500",
  HIGH: "border-l-amber-500",
  MEDIUM: "border-l-gold",
  LOW: "border-l-zinc-500",
};

interface TreasuryInsightsPanelProps {
  insights: TreasuryInsight[];
  className?: string;
}

export function TreasuryInsightsPanel({ insights, className }: TreasuryInsightsPanelProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {insights.map((insight) => {
        const tc = typeConfig[insight.type];
        const Icon = tc.icon;

        return (
          <div
            key={insight.id}
            className={cn(
              "border-l-2 bg-zinc-900/40 p-4 rounded-r-lg border border-r-white/[0.06] border-b-white/[0.06] border-t-white/[0.06]",
              severityBorder[insight.severity],
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("flex h-6 w-6 items-center justify-center rounded", tc.bg)}>
                  <Icon className={cn("h-3.5 w-3.5", tc.color)} />
                </div>
                <p className="text-[13px] font-medium text-white">{insight.title}</p>
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium uppercase tracking-[0.08em]",
                  insight.severity === "CRITICAL" ? "text-red-400" : insight.severity === "HIGH" ? "text-amber-400" : "text-zinc-500",
                )}
              >
                {insight.severity}
              </span>
            </div>
            <p className="mt-1 text-[12px] text-zinc-400">{insight.description}</p>
            <p className="mt-1 text-[10px] text-zinc-600">{new Date(insight.timestamp).toLocaleString()}</p>
          </div>
        );
      })}
    </div>
  );
}