"use client";

import { memo } from "react";
import { Filter, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
interface AIFiltersProps {
  selectedCategory?: string;
  onCategoryChange?: (c: string) => void;
  selectedSeverity?: string;
  onSeverityChange?: (s: string) => void;
  selectedStatus?: string;
  onStatusChange?: (s: string) => void;
  className?: string;
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: "All Categories", value: "" },
  { label: "Financial", value: "financial" },
  { label: "Operational", value: "operational" },
  { label: "Risk", value: "risk" },
  { label: "Compliance", value: "compliance" },
  { label: "Treasury", value: "treasury" },
  { label: "Tax", value: "tax" },
  { label: "Investments", value: "investments" },
  { label: "Revenue", value: "revenue" },
  { label: "Cost", value: "cost" },
  { label: "Fraud", value: "fraud" },
  { label: "Anomaly", value: "anomaly" },
  { label: "Forecast", value: "forecast" },
  { label: "Recommendation", value: "recommendation" },
];

const SEVERITIES: { label: string; value: string }[] = [
  { label: "All Severities", value: "" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const STATUSES: { label: string; value: string }[] = [
  { label: "All Statuses", value: "" },
  { label: "New", value: "new" },
  { label: "Reviewed", value: "reviewed" },
  { label: "Acknowledged", value: "acknowledged" },
  { label: "Actioned", value: "actioned" },
  { label: "Dismissed", value: "dismissed" },
];

export const AIFilters = memo(function AIFilters({
  selectedCategory, onCategoryChange,
  selectedSeverity, onSeverityChange,
  selectedStatus, onStatusChange,
  className,
}: AIFiltersProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Filter className="h-3.5 w-3.5" />
        <span>Filters</span>
      </div>

      <div className="relative">
        <select
          value={selectedCategory || ""}
          onChange={e => onCategoryChange?.(e.target.value)}
          className="appearance-none rounded-md border border-zinc-800/60 bg-zinc-900/60 px-3 py-1.5 pr-8 text-xs text-zinc-300 outline-none transition-colors hover:border-zinc-700/60 focus:border-gold/40"
        >
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500" />
      </div>

      <div className="relative">
        <select
          value={selectedSeverity || ""}
          onChange={e => onSeverityChange?.(e.target.value)}
          className="appearance-none rounded-md border border-zinc-800/60 bg-zinc-900/60 px-3 py-1.5 pr-8 text-xs text-zinc-300 outline-none transition-colors hover:border-zinc-700/60 focus:border-gold/40"
        >
          {SEVERITIES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500" />
      </div>

      <div className="relative">
        <select
          value={selectedStatus || ""}
          onChange={e => onStatusChange?.(e.target.value)}
          className="appearance-none rounded-md border border-zinc-800/60 bg-zinc-900/60 px-3 py-1.5 pr-8 text-xs text-zinc-300 outline-none transition-colors hover:border-zinc-700/60 focus:border-gold/40"
        >
          {STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500" />
      </div>
    </div>
  );
});
