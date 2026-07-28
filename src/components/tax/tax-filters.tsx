"use client";

import { useState, memo } from "react";
import { Search, Globe, Filter, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaxFiltersProps {
  onApply?: (filters: TaxFilterValues) => void;
  jurisdictions?: { value: string; label: string }[];
  className?: string;
}

export interface TaxFilterValues {
  search: string;
  jurisdiction: string;
  taxType: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

const TAX_TYPES = [
  { value: "", label: "All Types" },
  { value: "vat", label: "VAT" },
  { value: "gst", label: "GST" },
  { value: "corporate", label: "Corporate Tax" },
  { value: "withholding", label: "Withholding" },
  { value: "sales", label: "Sales Tax" },
  { value: "property", label: "Property Tax" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
  { value: "completed", label: "Completed" },
];

export const TaxFilters = memo(function TaxFilters({ onApply, jurisdictions = [], className }: TaxFiltersProps) {
  const [search, setSearch] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [taxType, setTaxType] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  function handleApply() {
    onApply?.({ search, jurisdiction, taxType, status, dateFrom, dateTo });
  }

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search tax records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-zinc-700/50 bg-zinc-800/60 py-2 pl-10 pr-3 text-sm text-white placeholder-zinc-500 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/30"
          />
        </div>

        <div className="relative">
          <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <select
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            className="appearance-none rounded-md border border-zinc-700/50 bg-zinc-800/60 py-2 pl-10 pr-8 text-sm text-zinc-300 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/30"
          >
            <option value="">All Jurisdictions</option>
            {jurisdictions.map((j) => (
              <option key={j.value} value={j.value}>{j.label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <select
            value={taxType}
            onChange={(e) => setTaxType(e.target.value)}
            className="appearance-none rounded-md border border-zinc-700/50 bg-zinc-800/60 py-2 pl-10 pr-8 text-sm text-zinc-300 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/30"
          >
            {TAX_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
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
          Apply Filters
        </button>
      </div>
    </div>
  );
});
