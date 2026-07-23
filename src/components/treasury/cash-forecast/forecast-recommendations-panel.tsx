"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Lightbulb, AlertTriangle, TrendingUp, DollarSign,
  Filter,
} from "lucide-react";
import { MOCK_RECOMMENDATIONS } from "./data";
import type { ForecastRecommendation } from "./types";

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const PRIORITY_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  critical: {
    label: "Critical",
    className: "bg-red-500/15 text-red-400 border-red-500/25",
    icon: AlertTriangle,
  },
  high: {
    label: "High",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    icon: Lightbulb,
  },
  medium: {
    label: "Medium",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    icon: Lightbulb,
  },
  low: {
    label: "Low",
    className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
    icon: Lightbulb,
  },
};

const CATEGORIES = [...new Set(MOCK_RECOMMENDATIONS.map((r) => r.category))];
const ENTITIES = [...new Set(MOCK_RECOMMENDATIONS.map((r) => r.entity))];

export function ForecastRecommendationsPanel() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [entityFilter, setEntityFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let data = [...MOCK_RECOMMENDATIONS];
    if (categoryFilter) data = data.filter((r) => r.category === categoryFilter);
    if (entityFilter) data = data.filter((r) => r.entity === entityFilter);
    if (priorityFilter) data = data.filter((r) => r.priority === priorityFilter);
    data.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    return data;
  }, [categoryFilter, entityFilter, priorityFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Forecast Recommendations</h2>
        <span className="text-sm text-zinc-400">{filtered.length} recommendations</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={categoryFilter ?? ""}
          onChange={(e) => setCategoryFilter(e.target.value || null)}
          className="text-xs bg-zinc-900/50 border border-white/10 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-[#c9a84c]/50"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </option>
          ))}
        </select>

        <select
          value={entityFilter ?? ""}
          onChange={(e) => setEntityFilter(e.target.value || null)}
          className="text-xs bg-zinc-900/50 border border-white/10 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-[#c9a84c]/50"
          aria-label="Filter by entity"
        >
          <option value="">All Entities</option>
          {ENTITIES.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>

        <select
          value={priorityFilter ?? ""}
          onChange={(e) => setPriorityFilter(e.target.value || null)}
          className="text-xs bg-zinc-900/50 border border-white/10 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-[#c9a84c]/50"
          aria-label="Filter by priority"
        >
          <option value="">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="space-y-1">
        {filtered.map((rec, idx) => {
          const PriorityIcon = PRIORITY_CONFIG[rec.priority].icon;
          return (
            <div
              key={rec.id}
              className={cn(
                "p-4 border border-white/[0.06] bg-zinc-900/50 transition-colors hover:bg-zinc-900/80",
                idx < filtered.length - 1 && "border-b-0"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    rec.priority === "critical"
                      ? "bg-red-500/15 text-red-400"
                      : "bg-[#c9a84c]/10 text-[#c9a84c]"
                  )}
                >
                  <PriorityIcon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full border",
                        PRIORITY_CONFIG[rec.priority].className
                      )}
                    >
                      {PRIORITY_CONFIG[rec.priority].label}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full border bg-zinc-800/50 text-zinc-400 border-zinc-700/50">
                      {rec.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>

                  <h3 className="text-sm font-medium text-white">{rec.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{rec.description}</p>

                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="text-sm font-semibold text-[#c9a84c] flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      {rec.impactLabel}
                    </span>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      ROI: {rec.roi}
                    </span>
                    <span className="text-xs text-zinc-500">{rec.entity}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-zinc-500 text-sm">
          No recommendations match the selected filters.
        </div>
      )}
    </div>
  );
}