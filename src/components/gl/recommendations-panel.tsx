"use client";

import { useState, memo } from "react";
import { Lightbulb, ChevronDown, ChevronUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GLRecommendation } from "./gl-types";

interface RecommendationsPanelProps {
  recommendations: GLRecommendation[];
  onImplement?: (id: string) => void;
  className?: string;
}

export const RecommendationsPanel = memo(function RecommendationsPanel({ recommendations, onImplement, className }: RecommendationsPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = [...recommendations]
    .filter((r) => !r.implemented)
    .sort((a, b) => b.confidence - a.confidence);

  if (sorted.length === 0) {
    return (
      <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-6", className)}>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-zinc-500" />
          <p className="text-sm text-zinc-500">All recommendations implemented</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <Lightbulb className="h-4 w-4 text-gold" />
          Recommendations ({sorted.length})
        </h2>
      </div>

      {sorted.slice(0, 10).map((rec) => {
        const isExpanded = expanded === rec.id;

        return (
          <div
            key={rec.id}
            className={cn(
              "rounded-lg border transition-colors",
              isExpanded ? "border-gold/20 bg-gold/[0.02]" : "border-zinc-800/60 bg-zinc-900/40",
              "hover:border-zinc-700/60"
            )}
          >
            <button
              onClick={() => setExpanded(isExpanded ? null : rec.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{rec.title}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{rec.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-700">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${rec.confidence}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-zinc-500">{rec.confidence}%</span>
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-zinc-800/40 px-4 pb-3 pt-2">
                <p className="text-sm text-zinc-400">{rec.description}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500">Impact: {rec.impact}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onImplement?.(rec.id);
                    }}
                    className="flex items-center gap-1.5 rounded-md border border-emerald-500/20 px-2 py-1 text-[11px] font-medium text-emerald-400 transition-colors hover:bg-emerald-500/10"
                  >
                    <Check className="h-3 w-3" />
                    Implement
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});
