"use client";

import { memo } from "react";
import { Search, Filter } from "lucide-react";

export const ComplianceFilters = memo(function ComplianceFilters() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search compliance records..."
          className="w-full rounded-lg border border-zinc-800/60 bg-zinc-900/60 py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-[#d4af37]/40 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/20"
        />
      </div>
      <button className="flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-700/60 hover:text-zinc-300">
        <Filter className="h-4 w-4" />
        Filters
      </button>
    </div>
  );
});
