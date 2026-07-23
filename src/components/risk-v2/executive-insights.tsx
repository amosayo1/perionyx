"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { RiskRecommendation } from "./risk-types";

interface ExecutiveInsightsProps {
  recommendations: RiskRecommendation[];
  max?: number;
}

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "text-emerald-400",
  medium: "text-amber-400",
  low: "text-zinc-400",
};

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return "high";
  if (confidence >= 0.6) return "medium";
  return "low";
}

export const ExecutiveInsights = memo(function ExecutiveInsights({ recommendations, max = 10 }: ExecutiveInsightsProps) {
  const sorted = [...recommendations].sort((a, b) => b.confidence - a.confidence).slice(0, max);

  if (sorted.length === 0) {
    return <p className="py-8 text-center text-sm text-zinc-500">No recommendations available</p>;
  }

  return (
    <div className="space-y-2">
      {sorted.map((rec) => {
        const confLabel = getConfidenceLabel(rec.confidence);
        return (
          <div key={rec.id} className={cn("rounded-lg border p-3 transition-colors", rec.implemented ? "border-emerald-500/20 bg-emerald-500/5" : "border-zinc-800/60 bg-zinc-900/40")}>
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded border border-zinc-700/60 px-1.5 py-0.5 text-xs text-zinc-400">{rec.type.replace("-", " ")}</span>
                  {rec.implemented && <span className="text-xs text-emerald-400">✓ Implemented</span>}
                </div>
                <p className="mt-1 text-sm font-medium text-white">{rec.title}</p>
                <p className="text-xs text-zinc-400 line-clamp-2">{rec.description}</p>
              </div>
              <div className="ml-3 flex flex-col items-end gap-1">
                <span className="text-xs text-zinc-500">Impact: {rec.impact}</span>
                <span className={cn("text-xs font-medium", CONFIDENCE_COLORS[confLabel])}>
                  {(rec.confidence * 100).toFixed(0)}% confidence
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});
