"use client";

import { useState, memo } from "react";
import { Search, Filter, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Portfolio } from "./investment-types";

interface InvestmentFiltersProps {
  portfolios: Portfolio[];
  onApply?: (filters: InvestmentFilterValues) => void;
  className?: string;
}

export interface InvestmentFilterValues {
  search: string;
  portfolioId: string;
  dateFrom: string;
  dateTo: string;
}

export const InvestmentFilters = memo(function InvestmentFilters({ portfolios, onApply, className }: InvestmentFiltersProps) {
  const [search, setSearch] = useState("");
  const [portfolioId, setPortfolioId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  function handleApply() {
    onApply?.({ search, portfolioId, dateFrom, dateTo });
  }

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search securities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-zinc-700/50 bg-zinc-800/60 py-2 pl-10 pr-3 text-sm text-white placeholder-zinc-500 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/30"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <select
            value={portfolioId}
            onChange={(e) => setPortfolioId(e.target.value)}
            className="appearance-none rounded-md border border-zinc-700/50 bg-zinc-800/60 py-2 pl-10 pr-8 text-sm text-zinc-300 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/30"
          >
            <option value="">All Portfolios</option>
            {portfolios.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-36 rounded-md border border-zinc-700/50 bg-zinc-800/60 py-2 pl-10 pr-3 text-sm text-zinc-300 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/30"
            />
          </div>
          <span className="text-xs text-zinc-600">to</span>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-36 rounded-md border border-zinc-700/50 bg-zinc-800/60 py-2 pl-10 pr-3 text-sm text-zinc-300 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/30"
            />
          </div>
        </div>
        <button
          onClick={handleApply}
          className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#c49f2e]"
        >
          Apply
        </button>
      </div>
    </div>
  );
});
