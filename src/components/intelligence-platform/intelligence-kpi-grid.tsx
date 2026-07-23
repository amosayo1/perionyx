"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { KpiCard } from "./kpi-card";
import { Search, ArrowUpDown } from "lucide-react";
import type { KPIValueData, KPICategory, KPIStatus } from "@/modules/intelligence-platform/types";

interface IntelligenceKpiGridProps {
  kpis: KPIValueData[];
  category?: string;
}

const CATEGORIES: Array<{ value: KPICategory | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "financial", label: "Financial" },
  { value: "treasury", label: "Treasury" },
  { value: "risk", label: "Risk" },
  { value: "operational", label: "Operational" },
  { value: "compliance", label: "Compliance" },
  { value: "executive", label: "Executive" },
];

const SORT_OPTIONS = [
  { value: "status", label: "Status" },
  { value: "value-desc", label: "Value (High)" },
  { value: "value-asc", label: "Value (Low)" },
  { value: "label", label: "Name" },
];

const STATUS_ORDER: Record<KPIStatus, number> = {
  critical: 0,
  at_risk: 1,
  on_track: 2,
  neutral: 3,
};

export function IntelligenceKpiGrid({ kpis, category }: IntelligenceKpiGridProps) {
  const [activeCategory, setActiveCategory] = useState<KPICategory | "all">((category as KPICategory) ?? "all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("status");

  const filtered = useMemo(() => {
    let result = [...kpis];
    if (activeCategory !== "all") {
      result = result.filter((k) => k.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((k) => k.label.toLowerCase().includes(q) || k.kpiKey.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      if (sort === "status") return (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
      if (sort === "value-desc") return b.currentValue - a.currentValue;
      if (sort === "value-asc") return a.currentValue - b.currentValue;
      return a.label.localeCompare(b.label);
    });
    return result;
  }, [kpis, activeCategory, search, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setActiveCategory(c.value)}
              className={cn(
                "whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
                activeCategory === c.value
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-zinc-800/60 text-zinc-500 hover:text-zinc-300",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search KPIs..."
              className="w-36 rounded-lg border border-white/[0.06] bg-zinc-800/60 py-1.5 pl-7 pr-2.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-amber-500/30 transition-colors"
            />
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none rounded-lg border border-white/[0.06] bg-zinc-800/60 py-1.5 pl-2.5 pr-7 text-xs text-zinc-400 outline-none focus:border-amber-500/30 transition-colors"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ArrowUpDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-600" />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="mb-2 h-8 w-8 text-zinc-700" />
          <p className="text-sm text-zinc-500">No KPIs found</p>
          <p className="mt-1 text-xs text-zinc-600">
            {search ? "Try adjusting your search or filters." : "No KPIs available for this category."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((kpi) => (
              <motion.div
                key={kpi.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                <KpiCard kpi={kpi} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <p className="text-[10px] text-zinc-700">
        Showing {filtered.length} of {kpis.length} KPIs
      </p>
    </div>
  );
}
