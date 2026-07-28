"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IncidentSeverity, IncidentStatus, IncidentCategory } from "./types";

interface Filters {
  severity: IncidentSeverity[];
  status: IncidentStatus[];
  category: IncidentCategory[];
}

interface Props {
  onChange: (filters: Filters) => void;
}

const severityOptions: { value: IncidentSeverity; label: string }[] = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const statusOptions: { value: IncidentStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "investigating", label: "Investigating" },
  { value: "awaiting_info", label: "Awaiting Info" },
  { value: "fix_in_progress", label: "Fix In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const categoryOptions: { value: IncidentCategory; label: string }[] = [
  { value: "treasury", label: "Treasury" },
  { value: "approvals", label: "Approvals" },
  { value: "ledger", label: "Ledger" },
  { value: "policy", label: "Policy" },
  { value: "risk", label: "Risk" },
  { value: "reconciliation", label: "Reconciliation" },
  { value: "notifications", label: "Notifications" },
  { value: "api", label: "API" },
];

function FilterChip<T extends string>({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
        active
          ? "bg-gold/10 text-gold border border-gold/20"
          : "bg-zinc-900/40 text-zinc-500 border border-white/[0.06] hover:text-zinc-300 hover:border-white/[0.1]",
      )}
    >
      {label}
    </button>
  );
}

export function IncidentFilterBar({ onChange }: Props) {
  const [filters, setFilters] = useState<Filters>({
    severity: [],
    status: [],
    category: [],
  });
  const [showAll, setShowAll] = useState(false);

  const toggle = <T extends keyof Filters>(group: T, value: Filters[T][number]) => {
    setFilters((prev) => {
      const current = prev[group] as readonly string[];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      const updated = { ...prev, [group]: next };
      onChange(updated);
      return updated;
    });
  };

  const clearAll = () => {
    const cleared = { severity: [], status: [], category: [] };
    setFilters(cleared);
    onChange(cleared);
  };

  const activeCount =
    filters.severity.length + filters.status.length + filters.category.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-zinc-500" />
        <span className="text-xs font-medium text-zinc-500">Filters</span>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" className="h-5 text-[10px] text-zinc-600 hover:text-white" onClick={clearAll}>
            <X className="h-3 w-3 mr-1" />
            Clear ({activeCount})
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {/* Severity */}
        {severityOptions.map((opt) => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            active={filters.severity.includes(opt.value)}
            onClick={() => toggle("severity", opt.value)}
          />
        ))}

        <span className="w-px h-5 bg-zinc-800 mx-1 self-center" />

        {/* Status */}
        {(showAll ? statusOptions : statusOptions.slice(0, 3)).map((opt) => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            active={filters.status.includes(opt.value)}
            onClick={() => toggle("status", opt.value)}
          />
        ))}

        <span className="w-px h-5 bg-zinc-800 mx-1 self-center" />

        {/* Category */}
        {(showAll ? categoryOptions : categoryOptions.slice(0, 3)).map((opt) => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            active={filters.category.includes(opt.value)}
            onClick={() => toggle("category", opt.value)}
          />
        ))}

        {!showAll && (statusOptions.length > 3 || categoryOptions.length > 3) && (
          <button
            onClick={() => setShowAll(true)}
            className="rounded-full px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            + more
          </button>
        )}
      </div>
    </div>
  );
}
