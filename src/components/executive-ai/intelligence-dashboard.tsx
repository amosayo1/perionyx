"use client";

import { useState, useMemo, memo } from "react";
import { Brain, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { InsightCard } from "./insight-card";
import { AIFilters } from "./ai-filters";
import type { ExecutiveInsight, InsightCategory, AnomalySeverity, InsightStatus } from "./ai-types";

interface IntelligenceDashboardProps {
  insights: ExecutiveInsight[];
  onAcknowledge?: (id: string) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

export const IntelligenceDashboard = memo(function IntelligenceDashboard({
  insights, onAcknowledge, onDismiss, className,
}: IntelligenceDashboardProps) {
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = [...insights];
    if (category) result = result.filter(i => i.category === category);
    if (severity) result = result.filter(i => i.severity === severity);
    if (status) result = result.filter(i => i.status === status);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [insights, category, severity, status, search]);

  const grouped = useMemo(() => {
    const groups = new Map<string, ExecutiveInsight[]>();
    for (const insight of filtered) {
      const g = groups.get(insight.category) || [];
      g.push(insight);
      groups.set(insight.category, g);
    }
    return groups;
  }, [filtered]);

  if (insights.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40 py-12", className)}>
        <div className="text-center">
          <Brain className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="mt-2 text-sm text-zinc-500">No insights detected yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <Brain className="h-4 w-4 text-gold" />
          Executive Intelligence ({filtered.length})
        </h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search insights..."
            className="w-48 rounded-md border border-zinc-800/60 bg-zinc-900/60 py-1.5 pl-8 pr-3 text-xs text-zinc-300 outline-none placeholder:text-zinc-600 focus:border-gold/40"
          />
        </div>
      </div>

      <AIFilters
        selectedCategory={category}
        onCategoryChange={setCategory}
        selectedSeverity={severity}
        onSeverityChange={setSeverity}
        selectedStatus={status}
        onStatusChange={setStatus}
      />

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-zinc-500">
            No insights match the selected filters
          </div>
        ) : (
          Array.from(grouped.entries()).map(([cat, catInsights]) => (
            <div key={cat} className="space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                <span className="h-px flex-1 bg-zinc-800/60" />
                <span>{cat}</span>
                <span className="h-px flex-1 bg-zinc-800/60" />
              </h3>
              {catInsights.map(insight => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onAcknowledge={onAcknowledge}
                  onDismiss={onDismiss}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
});
