"use client";

import { memo } from "react";
import { Lightbulb, TrendingUp, ArrowRight, DollarSign, Shield, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIRecommendation } from "./ai-types";

interface ExecutiveInsightsProps {
  recommendations: AIRecommendation[];
  onImplement?: (id: string) => void;
  onViewAll?: () => void;
  className?: string;
}

const EFFORT_BADGE: Record<string, { color: string; label: string }> = {
  low: { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Quick Win" },
  medium: { color: "text-amber-400 bg-amber-500/10 border-amber-500/20", label: "Medium Effort" },
  high: { color: "text-red-400 bg-red-500/10 border-red-500/20", label: "Strategic" },
};

export const ExecutiveInsights = memo(function ExecutiveInsights({
  recommendations, onImplement, onViewAll, className,
}: ExecutiveInsightsProps) {
  const pending = recommendations.filter(r => r.status === "pending").slice(0, 5);

  if (pending.length === 0) {
    return (
      <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-zinc-500" />
          <p className="text-sm text-zinc-500">All recommendations implemented</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <Lightbulb className="h-4 w-4 text-gold" />
          AI Recommendations ({recommendations.filter(r => r.status === "pending").length})
        </h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
          >
            View all <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {pending.map(rec => {
        const badge = EFFORT_BADGE[rec.effort];
        return (
          <div
            key={rec.id}
            className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3 transition-colors hover:border-zinc-700/60"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">{rec.title}</p>
                  <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-medium", badge.color)}>
                    {badge.label}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">{rec.sourceDomain} · {rec.category}</p>
              </div>
              {rec.roi !== undefined && (
                <div className="flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1">
                  <DollarSign className="h-3 w-3 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400">{(rec.roi / 1000).toFixed(0)}K</span>
                </div>
              )}
            </div>
            <p className="mt-1.5 text-xs text-zinc-400 line-clamp-2">{rec.description}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">Impact: {rec.impact}</span>
              <button
                onClick={() => onImplement?.(rec.id)}
                className="flex items-center gap-1 rounded-md border border-emerald-500/20 px-2 py-1 text-[11px] font-medium text-emerald-400 transition-colors hover:bg-emerald-500/10"
              >
                <CheckCircle className="h-3 w-3" />
                Implement
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
});
