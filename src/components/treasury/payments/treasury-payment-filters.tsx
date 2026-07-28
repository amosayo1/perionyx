"use client";

import { cn } from "@/lib/utils";
import { Filter, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  MOCK_REGIONS, MOCK_ENTITIES, MOCK_BANKS, MOCK_CURRENCIES,
  MOCK_PAYMENT_TYPES, MOCK_RAILS, MOCK_COUNTERPARTIES,
} from "./data";

interface TreasuryPaymentFiltersProps {
  className?: string;
}

interface FilterState {
  region: string;
  legalEntity: string;
  businessUnit: string;
  bank: string;
  currency: string;
  paymentType: string;
  paymentRail: string;
  priority: string;
  status: string;
  approver: string;
  counterparty: string;
}

const BUSINESS_UNITS = ["All", "Corporate", "Operations", "Finance", "Engineering", "Sales"];
const PRIORITIES = ["All", "urgent", "high", "normal", "low"];
const STATUSES = ["All", "draft", "pending_approval", "approved", "queued", "processing", "settled", "failed", "cancelled"];
const APPROVERS = ["All", "John Smith", "Sarah Chen", "Mike Johnson", "Anna Kowalski", "Carlos Rivera", "Emily Watson", "David Park", "Lisa Tanaka"];

const allFilters: { key: keyof FilterState; label: string; options: string[] }[] = [
  { key: "region", label: "Region", options: ["All", ...MOCK_REGIONS] },
  { key: "legalEntity", label: "Legal Entity", options: ["All", ...MOCK_ENTITIES] },
  { key: "businessUnit", label: "Business Unit", options: BUSINESS_UNITS },
  { key: "bank", label: "Bank", options: ["All", ...MOCK_BANKS] },
  { key: "currency", label: "Currency", options: ["All", ...MOCK_CURRENCIES] },
  { key: "paymentType", label: "Payment Type", options: ["All", ...MOCK_PAYMENT_TYPES.map((t) => t.toString())] },
  { key: "paymentRail", label: "Payment Rail", options: ["All", ...MOCK_RAILS] },
  { key: "priority", label: "Priority", options: PRIORITIES },
  { key: "status", label: "Status", options: STATUSES },
  { key: "approver", label: "Approver", options: APPROVERS },
  { key: "counterparty", label: "Counterparty", options: ["All", ...MOCK_COUNTERPARTIES.map((c) => c.name)] },
];

const initialFilters: FilterState = {
  region: "All",
  legalEntity: "All",
  businessUnit: "All",
  bank: "All",
  currency: "All",
  paymentType: "All",
  paymentRail: "All",
  priority: "All",
  status: "All",
  approver: "All",
  counterparty: "All",
};

function FilterSelect({ label, options, value, onChange }: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-white/[0.06] bg-zinc-800/50 px-3 py-2 text-[13px] text-zinc-200 outline-none appearance-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
        aria-label={`Filter by ${label.toLowerCase()}`}
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-zinc-800">{opt}</option>
        ))}
      </select>
    </div>
  );
}

export function TreasuryPaymentFilters({ className }: TreasuryPaymentFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [showMore, setShowMore] = useState(false);

  const inlineFilters = allFilters.slice(0, 6);
  const moreFilters = allFilters.slice(6);

  const activeCount = Object.values(filters).filter((v) => v !== "All").length;

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAll = () => setFilters(initialFilters);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowMore((p) => !p)}
          className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900/50 px-4 py-2.5 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white lg:hidden"
          aria-label={showMore ? "Hide filters" : "Show filters"}
          aria-expanded={showMore}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 text-[11px] text-gold">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <div className={cn("flex flex-wrap items-end gap-3", !showMore && "hidden lg:flex")}>
        {inlineFilters.map((f) => (
          <FilterSelect
            key={f.key}
            label={f.label}
            options={f.options}
            value={filters[f.key]}
            onChange={(v) => updateFilter(f.key, v)}
          />
        ))}

        <button
          onClick={() => setShowMore((p) => !p)}
          className="flex items-center gap-1 rounded-lg border border-white/[0.06] px-3 py-2 text-[12px] text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white self-end"
          aria-label={showMore ? "Show fewer filters" : "Show more filters"}
          aria-expanded={showMore}
        >
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showMore && "rotate-180")} />
          {showMore ? "Fewer Filters" : "More Filters"}
        </button>

        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 rounded-lg border border-white/[0.06] px-3 py-2 text-[12px] text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white self-end"
            aria-label="Clear all filters"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {showMore && (
        <div className="flex flex-wrap items-end gap-3">
          {moreFilters.map((f) => (
            <FilterSelect
              key={f.key}
              label={f.label}
              options={f.options}
              value={filters[f.key]}
              onChange={(v) => updateFilter(f.key, v)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
