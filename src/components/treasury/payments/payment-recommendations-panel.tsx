"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Lightbulb, AlertTriangle, ChevronDown, Filter,
} from "lucide-react";
import {
  MOCK_RECOMMENDATIONS, MOCK_ENTITIES,
} from "./data";
import type { RecommendationCategory, RecommendationPriority } from "./types";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "All", label: "All Categories" },
  { value: "timing", label: "Timing" },
  { value: "collections", label: "Collections" },
  { value: "rail_optimization", label: "Rail Optimization" },
  { value: "consolidation", label: "Consolidation" },
  { value: "risk", label: "Risk" },
  { value: "liquidity", label: "Liquidity" },
  { value: "duplicate", label: "Duplicate" },
  { value: "fx", label: "FX" },
];

const PRIORITY_ORDER: Record<RecommendationPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const PRIORITY_STYLES: Record<RecommendationPriority, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  medium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  low: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const CATEGORY_LABELS: Record<RecommendationCategory, string> = {
  timing: "Timing",
  collections: "Collections",
  rail_optimization: "Rail Optimization",
  consolidation: "Consolidation",
  risk: "Risk",
  liquidity: "Liquidity",
  duplicate: "Duplicate",
  fx: "FX",
};

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

interface PaymentRecommendationsPanelProps {
  className?: string;
}

export function PaymentRecommendationsPanel({ className }: PaymentRecommendationsPanelProps) {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [entityFilter, setEntityFilter] = useState("All");

  const filtered = useMemo(() => {
    let items = [...MOCK_RECOMMENDATIONS];

    if (categoryFilter !== "All") {
      items = items.filter((r) => r.category === categoryFilter);
    }
    if (entityFilter !== "All") {
      items = items.filter((r) => r.entity === entityFilter);
    }

    items.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

    return items;
  }, [categoryFilter, entityFilter]);

  return (
    <div className={cn("flex flex-col", className)} aria-label="Payment recommendations panel">
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-2">
          <label htmlFor="rec-category-filter" className="sr-only">Category filter</label>
          <div className="relative">
            <select
              id="rec-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none rounded-md border border-white/[0.06] bg-zinc-800/50 px-3 py-1.5 pr-8 text-[12px] text-zinc-300 outline-none focus:border-gold/50"
              aria-label="Filter by category"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="rec-entity-filter" className="sr-only">Entity filter</label>
          <div className="relative">
            <select
              id="rec-entity-filter"
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="appearance-none rounded-md border border-white/[0.06] bg-zinc-800/50 px-3 py-1.5 pr-8 text-[12px] text-zinc-300 outline-none focus:border-gold/50"
              aria-label="Filter by entity"
            >
              <option value="All">All Entities</option>
              {MOCK_ENTITIES.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          </div>
        </div>
        <div className="ml-auto text-[12px] text-zinc-500">
          <Filter className="mr-1 inline h-3.5 w-3.5" />
          {filtered.length} of {MOCK_RECOMMENDATIONS.length} recommendations
        </div>
      </div>

      <div className="flex-1 divide-y divide-white/[0.06] overflow-y-auto">
        {filtered.map((rec) => (
          <div
            key={rec.id}
            className="px-5 py-4 transition-colors hover:bg-zinc-800/30"
            role="article"
            aria-label={`Recommendation: ${rec.title}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                {rec.priority === "critical" ? (
                  <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                ) : (
                  <Lightbulb className="h-5 w-5 text-amber-400" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                    PRIORITY_STYLES[rec.priority],
                  )}>
                    {rec.priority}
                  </span>
                  <span className="inline-flex items-center rounded-md border border-white/[0.06] bg-zinc-800/50 px-2 py-0.5 text-[10px] text-zinc-400">
                    {CATEGORY_LABELS[rec.category]}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-white">{rec.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">{rec.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <span className="text-[12px] font-semibold text-gold">{rec.impactLabel}</span>
                  <span className="text-[12px] text-zinc-500">{rec.roi}</span>
                  <span className="text-[12px] text-zinc-500">{rec.entity}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-16 text-[13px] text-zinc-500">
            No recommendations match the selected filters
          </div>
        )}
      </div>
    </div>
  );
}
