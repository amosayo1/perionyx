"use client";

import { cn } from "@/lib/utils";
import { Lightbulb, AlertTriangle, ArrowRight } from "lucide-react";
import { MOCK_RECOMMENDATIONS } from "./data";

export function TreasuryRecommendationsPanel({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h3 className="text-sm font-medium text-white">Treasury Recommendations</h3>
        <p className="text-[12px] text-zinc-500">AI-powered recommendations based on current liquidity position</p>
      </div>
      <div className="divide-y divide-white/[0.06]">
        {MOCK_RECOMMENDATIONS.map((rec) => (
          <div key={rec.id} className="flex items-start gap-4 px-5 py-4 hover:bg-zinc-800/20 transition-colors">
            <div className={cn("mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg",
              rec.priority === "critical" ? "bg-red-500/10" : rec.priority === "high" ? "bg-amber-500/10" : "bg-blue-500/10")}>
              {rec.priority === "critical" ? (
                <AlertTriangle className="h-4 w-4 text-red-400" />
              ) : (
                <Lightbulb className={cn("h-4 w-4", rec.priority === "high" ? "text-amber-400" : "text-blue-400")} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] font-medium text-white">{rec.action}</p>
                  <p className="text-[12px] text-zinc-400 mt-0.5">{rec.rationale}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-[#c9a84c]">{rec.impactLabel}</p>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium",
                    rec.priority === "critical" ? "bg-red-500/10 text-red-400" :
                    rec.priority === "high" ? "bg-amber-500/10 text-amber-400" :
                    "bg-blue-500/10 text-blue-400")}>
                    {rec.priority}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-500">
                <span>{rec.category}</span>
                <span>&bull;</span>
                <span>{rec.entity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
