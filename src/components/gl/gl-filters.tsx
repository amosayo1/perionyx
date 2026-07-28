"use client";

import { useState, memo } from "react";
import { Search, Calendar, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface GLFiltersProps {
  onApply?: (filters: GLFilterValues) => void;
  className?: string;
}

export interface GLFilterValues {
  search: string;
  period: string;
  status: string;
  source: string;
}

const PERIODS = [
  { value: "", label: "All Periods" },
  { value: "2026-01", label: "2026-01" },
  { value: "2026-02", label: "2026-02" },
  { value: "2026-03", label: "2026-03" },
  { value: "2026-04", label: "2026-04" },
  { value: "2026-05", label: "2026-05" },
  { value: "2026-06", label: "2026-06" },
  { value: "2026-07", label: "2026-07" },
  { value: "2026-08", label: "2026-08" },
  { value: "2026-09", label: "2026-09" },
  { value: "2026-10", label: "2026-10" },
  { value: "2026-11", label: "2026-11" },
  { value: "2026-12", label: "2026-12" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Approved" },
  { value: "posted", label: "Posted" },
];

const SOURCE_OPTIONS = [
  { value: "", label: "All Sources" },
  { value: "manual", label: "Manual" },
  { value: "recurring", label: "Recurring" },
  { value: "system", label: "System" },
  { value: "allocation", label: "Allocation" },
  { value: "intercompany", label: "Intercompany" },
];

export const GLFilters = memo(function GLFilters({ onApply, className }: GLFiltersProps) {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");

  function handleApply() {
    onApply?.({ search, period, status, source });
  }

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search GL records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-zinc-700/50 bg-zinc-800/60 py-2 pl-10 pr-3 text-sm text-white placeholder-zinc-500 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/30"
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="appearance-none rounded-md border border-zinc-700/50 bg-zinc-800/60 py-2 pl-10 pr-8 text-sm text-zinc-300 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/30"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="appearance-none rounded-md border border-zinc-700/50 bg-zinc-800/60 py-2 pl-10 pr-8 text-sm text-zinc-300 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/30"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="appearance-none rounded-md border border-zinc-700/50 bg-zinc-800/60 py-2 pl-10 pr-8 text-sm text-zinc-300 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/30"
          >
            {SOURCE_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleApply}
          className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#c49f2e]"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
});
