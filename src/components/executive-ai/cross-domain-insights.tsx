"use client";

import { useState, memo } from "react";
import { Share2, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CrossDomainInsight } from "./ai-types";

interface CrossDomainInsightsProps {
  insights: CrossDomainInsight[];
  className?: string;
}

export const CrossDomainInsights = memo(function CrossDomainInsights({ insights, className }: CrossDomainInsightsProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (insights.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40 py-8", className)}>
        <div className="text-center">
          <Share2 className="mx-auto h-6 w-6 text-zinc-600" />
          <p className="mt-1 text-sm text-zinc-500">No cross-domain insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
        <Share2 className="h-4 w-4 text-purple-400" />
        Cross-Domain Insights ({insights.length})
      </h2>

      {insights.map(insight => {
        const isExpanded = expanded === insight.id;
        return (
          <div
            key={insight.id}
            className={cn(
              "rounded-lg border transition-colors",
              isExpanded ? "border-purple-500/20 bg-purple-500/[0.02]" : "border-zinc-800/60 bg-zinc-900/40",
              "hover:border-zinc-700/60"
            )}
          >
            <button
              onClick={() => setExpanded(isExpanded ? null : insight.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{insight.title}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  {insight.domains.map((d, i) => (
                    <span key={d}>
                      <span className="text-xs text-purple-400">{d}</span>
                      {i < insight.domains.length - 1 && <ArrowRight className="mx-1 inline h-3 w-3 text-zinc-600" />}
                    </span>
                  ))}
                </div>
              </div>
              {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
            </button>

            {isExpanded && (
              <div className="border-t border-zinc-800/40 px-4 pb-3 pt-2">
                <p className="text-sm text-zinc-400">{insight.description}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-zinc-500">
                    <span className="text-zinc-400">Correlation:</span> {insight.correlation}
                  </p>
                  <p className="text-xs text-zinc-500">
                    <span className="text-zinc-400">Significance:</span> {insight.significance}
                  </p>
                </div>
                {Object.keys(insight.affectedMetrics).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(insight.affectedMetrics).map(([key, val]) => (
                      <span key={key} className="rounded-md bg-zinc-800/60 px-2 py-1 text-[11px] text-zinc-400">
                        {key.replace(/([A-Z])/g, " $1").trim()}: <span className="text-zinc-300">{typeof val === "number" ? val.toLocaleString() : val}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});
