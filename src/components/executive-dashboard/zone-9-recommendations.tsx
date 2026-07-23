"use client";

import { memo } from "react";
import { ArrowRight, TrendingUp, Clock, DollarSign, Target } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DashboardCard } from "./dashboard-card";
import type { Recommendation } from "./types";

interface Zone9Props {
  recommendations: Recommendation[];
  className?: string;
}

const impactColors = {
  high: { dot: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-400" },
  medium: { dot: "bg-amber-500", badge: "bg-amber-500/10 text-amber-400" },
  low: { dot: "bg-zinc-500", badge: "bg-zinc-500/10 text-zinc-400" },
};

export const Zone9Recommendations = memo(function Zone9Recommendations({ recommendations, className }: Zone9Props) {
  const defaultRecs: Recommendation[] = recommendations.length > 0 ? recommendations : [
    { id: "1", title: "Optimize idle cash allocation", description: "Move excess USD balance to high-yield account", impact: "high", confidence: 92, roi: "+$12.4K/yr", timeSaved: "2h/week", category: "Treasury" },
    { id: "2", title: "Automate reconciliation", description: "Enable auto-match for 85% of transactions", impact: "high", confidence: 88, roi: "+$8.2K/yr", timeSaved: "8h/week", category: "Operations" },
    { id: "3", title: "Streamline approval routing", description: "Reduce approval chain by 2 steps for invoices under $5K", impact: "medium", confidence: 76, roi: "+$3.5K/yr", timeSaved: "4h/week", category: "Workflow" },
  ];

  return (
    <DashboardCard
      title="Enterprise Recommendations"
      description="Optimization Engine insights"
      size="two-thirds"
      className={className}
    >
      <div className="space-y-2">
        {defaultRecs.map((rec) => {
          const ic = impactColors[rec.impact];
          return (
            <div
              key={rec.id}
              className="group/card rounded-lg border border-zinc-800/40 bg-zinc-800/20 p-3.5 transition-all hover:border-zinc-700/40 hover:bg-zinc-800/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full shrink-0", ic.dot)} />
                    <span className="text-[13px] font-medium text-zinc-200">{rec.title}</span>
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold", ic.badge)}>
                      {rec.impact}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-zinc-500">{rec.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-500">Confidence</p>
                    <p className="text-[12px] font-semibold text-zinc-200">{rec.confidence}%</p>
                  </div>
                </div>
              </div>
              {(rec.roi || rec.timeSaved) && (
                <div className="mt-2 flex items-center gap-3">
                  {rec.roi && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                      <DollarSign className="h-3 w-3" />
                      {rec.roi}
                    </span>
                  )}
                  {rec.timeSaved && (
                    <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                      <Clock className="h-3 w-3" />
                      {rec.timeSaved}
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-600">{rec.category}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Link
        href="/insights"
        className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-800/40 py-2 text-[12px] font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      >
        View All Recommendations
        <ArrowRight className="h-3 w-3" />
      </Link>
    </DashboardCard>
  );
});
