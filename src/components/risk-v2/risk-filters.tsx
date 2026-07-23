"use client";

import { memo, useState } from "react";
import { Search, X } from "lucide-react";
import type { RiskCategory, RiskLevel, RiskStatus } from "./risk-types";

interface RiskFiltersProps {
  onFilterChange: (filters: { search: string; category: string; level: string; status: string }) => void;
}

const CATEGORIES: RiskCategory[] = ["market", "credit", "liquidity", "fx", "interest-rate", "operational", "counterparty", "country", "concentration", "settlement", "funding", "investment", "treasury", "bank"];
const LEVELS: RiskLevel[] = ["low", "medium", "high", "critical"];
const STATUSES: RiskStatus[] = ["identified", "assessed", "mitigated", "monitored", "closed", "historical", "emerging"];

export const RiskFilters = memo(function RiskFilters({ onFilterChange }: RiskFiltersProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [status, setStatus] = useState("");

  const update = (partial: Record<string, string>) => {
    const filters = { search, category, level, status, ...partial };
    onFilterChange(filters);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setLevel("");
    setStatus("");
    onFilterChange({ search: "", category: "", level: "", status: "" });
  };

  const hasFilters = search || category || level || status;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search risks..."
          value={search}
          onChange={e => { setSearch(e.target.value); update({ search: e.target.value }); }}
          className="w-full rounded-md border border-zinc-700/60 bg-zinc-800/40 py-2 pl-10 pr-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-600"
        />
      </div>
      <select value={category} onChange={e => { setCategory(e.target.value); update({ category: e.target.value }); }} className="rounded-md border border-zinc-700/60 bg-zinc-800/40 px-3 py-2 text-sm text-white outline-none focus:border-zinc-600">
        <option value="">All Categories</option>
        {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
      </select>
      <select value={level} onChange={e => { setLevel(e.target.value); update({ level: e.target.value }); }} className="rounded-md border border-zinc-700/60 bg-zinc-800/40 px-3 py-2 text-sm text-white outline-none focus:border-zinc-600">
        <option value="">All Levels</option>
        {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
      </select>
      <select value={status} onChange={e => { setStatus(e.target.value); update({ status: e.target.value }); }} className="rounded-md border border-zinc-700/60 bg-zinc-800/40 px-3 py-2 text-sm text-white outline-none focus:border-zinc-600">
        <option value="">All Statuses</option>
        {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
      </select>
      {hasFilters && (
        <button onClick={clearFilters} className="flex items-center gap-1 rounded-md px-2 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});
