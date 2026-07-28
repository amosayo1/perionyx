"use client";

import { useState, useMemo, memo } from "react";
import { Lightbulb, Check, X, ChevronDown, ChevronUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIRecommendation } from "./ai-types";

interface RecommendationBoardProps {
  recommendations: AIRecommendation[];
  onImplement?: (id: string) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

const CONFIDENCE_COLORS: Record<string, string> = {
  "very-high": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  high: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  low: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "very-low": "text-red-400 bg-red-500/10 border-red-500/20",
};

const EFFORT_COLORS: Record<string, string> = {
  low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  high: "text-red-400 bg-red-500/10 border-red-500/20",
};

export const RecommendationBoard = memo(function RecommendationBoard({
  recommendations, onImplement, onDismiss, className,
}: RecommendationBoardProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "implemented" | "dismissed">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = [...recommendations];
    if (filter !== "all") result = result.filter(r => r.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => {
      const order = { pending: 0, implemented: 1, dismissed: 2 };
      return order[a.status] - order[b.status];
    });
  }, [recommendations, filter, search]);

  if (recommendations.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40 py-12", className)}>
        <div className="text-center">
          <Lightbulb className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="mt-2 text-sm text-zinc-500">No recommendations yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <Lightbulb className="h-4 w-4 text-gold" />
          Recommendations ({recommendations.length})
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-40 rounded-md border border-zinc-800/60 bg-zinc-900/60 py-1.5 pl-8 pr-3 text-xs text-zinc-300 outline-none placeholder:text-zinc-600 focus:border-gold/40"
            />
          </div>
          <div className="flex rounded-md border border-zinc-800/60 bg-zinc-900/60 text-xs">
            {(["all", "pending", "implemented", "dismissed"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-2.5 py-1.5 transition-colors",
                  filter === f ? "bg-gold/10 text-gold" : "text-zinc-500 hover:text-zinc-300",
                  f === "all" && "rounded-l-md",
                  f === "dismissed" && "rounded-r-md"
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map(rec => {
          const isExpanded = expanded === rec.id;
          return (
            <div
              key={rec.id}
              className={cn(
                "rounded-lg border transition-colors",
                rec.status === "implemented" && "border-emerald-500/10 bg-emerald-500/[0.02]",
                rec.status === "dismissed" && "border-zinc-800/40 bg-zinc-900/30 opacity-60",
                rec.status === "pending" && (isExpanded ? "border-zinc-700/60 bg-zinc-900/60" : "border-zinc-800/60 bg-zinc-900/40"),
                "hover:border-zinc-700/60"
              )}
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : rec.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{rec.title}</p>
                    <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider", CONFIDENCE_COLORS[rec.confidence])}>
                      {rec.confidence.replace("-", " ")}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">{rec.sourceDomain} · {rec.category} · Effort: {rec.effort}</p>
                </div>
                <div className="flex items-center gap-2">
                  {rec.roi !== undefined && (
                    <span className="text-[11px] text-emerald-400">ROI ${rec.roi.toLocaleString()}</span>
                  )}
                  {rec.status === "implemented" && <Check className="h-4 w-4 text-emerald-400" />}
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-zinc-800/40 px-4 pb-3 pt-2">
                  <p className="text-sm text-zinc-400">{rec.description}</p>
                  <p className="mt-1 text-xs text-zinc-500">Impact: {rec.impact}</p>

                  {rec.actions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-[11px] font-medium text-zinc-500">Actions:</p>
                      {rec.actions.map((a, i) => (
                        <p key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-400">
                          <span className="mt-0.5 text-gold">{i + 1}.</span>
                          {a}
                        </p>
                      ))}
                    </div>
                  )}

                  {rec.status === "pending" && (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => onImplement?.(rec.id)}
                        className="flex items-center gap-1 rounded-md border border-emerald-500/20 px-2 py-1 text-[11px] font-medium text-emerald-400 transition-colors hover:bg-emerald-500/10"
                      >
                        <Check className="h-3 w-3" />
                        Implement
                      </button>
                      <button
                        onClick={() => onDismiss?.(rec.id)}
                        className="flex items-center gap-1 rounded-md border border-zinc-700/40 px-2 py-1 text-[11px] text-zinc-500 transition-colors hover:bg-zinc-800/60"
                      >
                        <X className="h-3 w-3" />
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
