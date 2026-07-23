"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Lightbulb, AlertTriangle } from "lucide-react";
import { MOCK_RECOMMENDATIONS } from "./data";
import type { RiskRecommendation } from "./types";

type Priority = "critical" | "high" | "medium" | "low";

const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const PRIORITY_STYLES: Record<
  Priority,
  { badge: string; dot: string }
> = {
  critical: { badge: "bg-red-500/20 text-red-300", dot: "bg-red-500" },
  high: { badge: "bg-amber-500/20 text-amber-300", dot: "bg-amber-500" },
  medium: { badge: "bg-blue-500/20 text-blue-300", dot: "bg-blue-500" },
  low: { badge: "bg-zinc-500/20 text-zinc-300", dot: "bg-zinc-500" },
};

const CATEGORY_STYLES: Record<string, string> = {
  FX: "bg-violet-500/15 text-violet-300",
  liquidity: "bg-sky-500/15 text-sky-300",
  counterparty: "bg-orange-500/15 text-orange-300",
  concentration: "bg-pink-500/15 text-pink-300",
  hedge: "bg-teal-500/15 text-teal-300",
  country: "bg-rose-500/15 text-rose-300",
  interest_rate: "bg-cyan-500/15 text-cyan-300",
  policy: "bg-indigo-500/15 text-indigo-300",
  compliance: "bg-emerald-500/15 text-emerald-300",
};

const CATEGORY_FILTER_MAP: Record<string, string[]> = {
  fx_hedge: ["FX"],
  diversify_counterparties: ["counterparty", "concentration"],
  refinance_debt: ["liquidity", "interest_rate"],
  increase_liquidity: ["liquidity"],
  reduce_concentration: ["concentration"],
  rebalance_hedge: ["hedge"],
  review_country_exposure: ["country"],
};

const CATEGORY_FILTER_LABELS: Record<string, string> = {
  fx_hedge: "FX Hedge",
  diversify_counterparties: "Diversify Counterparties",
  refinance_debt: "Refinance Debt",
  increase_liquidity: "Increase Liquidity",
  reduce_concentration: "Reduce Concentration",
  rebalance_hedge: "Rebalance Hedge",
  review_country_exposure: "Review Country Exposure",
};

const PRIORITIES: ("All" | Priority)[] = ["All", "critical", "high", "medium", "low"];

const ENTITIES = Array.from(new Set(MOCK_RECOMMENDATIONS.map((r) => r.entity))).sort();

function formatImpact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

export function RiskRecommendationsPanel({ className }: { className?: string }) {
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [entityFilter, setEntityFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | Priority>("All");

  const filtered = useMemo(() => {
    let list = [...MOCK_RECOMMENDATIONS];

    if (categoryFilter !== "All") {
      const mapped = CATEGORY_FILTER_MAP[categoryFilter];
      if (mapped) {
        list = list.filter((r) => mapped.includes(r.category));
      }
    }

    if (entityFilter !== "All") {
      list = list.filter((r) => r.entity === entityFilter);
    }

    if (priorityFilter !== "All") {
      list = list.filter((r) => r.priority === priorityFilter);
    }

    list.sort(
      (a, b) =>
        (PRIORITY_ORDER[a.priority as Priority] ?? 99) -
        (PRIORITY_ORDER[b.priority as Priority] ?? 99)
    );

    return list;
  }, [categoryFilter, entityFilter, priorityFilter]);

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-medium text-white">Risk Recommendations</h3>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400">
            {MOCK_RECOMMENDATIONS.length}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-4 py-2">
        <div className="flex gap-1" role="group" aria-label="Priority filter">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriorityFilter(p)}
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-medium capitalize transition-colors",
                priorityFilter === p
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
              aria-pressed={priorityFilter === p}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-white/[0.06]" />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-white/[0.06] bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300 outline-none"
          aria-label="Filter by category"
        >
          <option value="All">All Categories</option>
          {Object.keys(CATEGORY_FILTER_MAP).map((key) => (
            <option key={key} value={key}>
              {CATEGORY_FILTER_LABELS[key]}
            </option>
          ))}
        </select>
        <div className="h-4 w-px bg-white/[0.06]" />
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="rounded-md border border-white/[0.06] bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300 outline-none"
          aria-label="Filter by entity"
        >
          <option value="All">All Entities</option>
          {ENTITIES.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      <div className="max-h-[600px] overflow-y-auto" role="list">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-zinc-500">
            <Lightbulb className="h-8 w-8" />
            <span className="text-[13px]">No recommendations match filters</span>
          </div>
        ) : (
          filtered.map((rec, i) => (
            <div
              key={rec.id}
              className={cn(
                "px-4 py-3 transition-colors hover:bg-white/[0.02]",
                i < filtered.length - 1 && "border-b border-white/[0.03]"
              )}
              role="listitem"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800">
                  {rec.priority === "critical" || rec.priority === "high" ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  ) : (
                    <Lightbulb className="h-3.5 w-3.5 text-zinc-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[13px] font-medium text-white">
                        {rec.title}
                      </span>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-zinc-400">
                        {rec.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                        PRIORITY_STYLES[rec.priority as Priority]?.badge ??
                          "bg-zinc-500/20 text-zinc-300"
                      )}
                    >
                      {rec.priority}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                        CATEGORY_STYLES[rec.category] ?? "bg-zinc-700 text-zinc-300"
                      )}
                    >
                      {rec.category.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] font-medium text-amber-400/90">
                      {formatImpact(rec.impact)}
                    </span>
                    <span className="text-[11px] text-zinc-500">{rec.roi} ROI</span>
                    <span className="text-[11px] text-zinc-500">{rec.entity}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
