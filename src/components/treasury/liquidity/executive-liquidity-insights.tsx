"use client";

import { cn } from "@/lib/utils";
import { MOCK_INSIGHTS } from "./data";

export function ExecutiveLiquidityInsights({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5", className)}>
      <h3 className="text-sm font-medium text-white">Executive Insights</h3>
      <p className="mb-4 text-[12px] text-zinc-500">Key observations for Group Treasurer & CFO</p>
      <div className="space-y-3">
        {MOCK_INSIGHTS.map((insight) => (
          <div key={insight.type} className={cn("rounded-lg border p-3",
            insight.severity === "critical" ? "border-red-500/20 bg-red-500/5" :
            insight.severity === "warning" ? "border-amber-500/20 bg-amber-500/5" :
            "border-emerald-500/20 bg-emerald-500/5")}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{insight.title}</p>
              <span className={cn("text-sm font-semibold",
                insight.severity === "critical" ? "text-red-400" :
                insight.severity === "warning" ? "text-amber-400" : "text-emerald-400")}>
                {insight.value}
              </span>
            </div>
            <p className="mt-1 text-[12px] text-zinc-400 leading-relaxed">{insight.description}</p>
            {insight.action && (
              <p className="mt-1.5 text-[11px] font-medium text-[#c9a84c]">→ {insight.action}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
