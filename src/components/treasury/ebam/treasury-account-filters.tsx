"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, X, Filter } from "lucide-react";
import { useState } from "react";
import type { DashboardFilters } from "./types";
import {
  MOCK_REGIONS, MOCK_COUNTRIES, MOCK_ENTITIES, MOCK_BANKS, MOCK_CURRENCIES,
} from "./data";

const ACCOUNT_TYPES = ["All","checking","savings","money_market","escrow","payroll","tax","investment","collateral","concentration","disbursement","multi_currency","overdraft"];
const OWNERSHIP = ["All","wholly_owned","joint_venture","subsidiary","trust","partnership"];
const LIFECYCLES = ["All","requested","opening","pending_documentation","kyc_review","approval","active","dormant","restricted","closing","closed"];
const STATUSES = ["All","active","dormant","restricted","frozen","closing","closed","pending_approval"];
const KYCS = ["All","complete","pending","expired","in_review","missing_documents"];
const MANDATES = ["All","active","expiring","expired","revoked","pending_renewal"];
const RISKS = ["All","low","medium","high","critical"];

interface TreasuryAccountFiltersProps {
  className?: string;
  onFiltersChange?: (filters: DashboardFilters) => void;
}

const defaultFilters: DashboardFilters = {
  region: null, country: null, legalEntity: null, businessUnit: null,
  bank: null, currency: null, accountType: null, ownership: null,
  lifecycleStatus: null, accountStatus: null, kycStatus: null,
  mandateStatus: null, riskLevel: null, dateOpened: null, signatory: null,
};

export function TreasuryAccountFilters({ className, onFiltersChange }: TreasuryAccountFiltersProps) {
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [showMore, setShowMore] = useState(false);

  const set = (key: keyof DashboardFilters, value: string | [string, string] | null) => {
    const next = { ...filters, [key]: value === "All" ? null : value };
    setFilters(next);
    onFiltersChange?.(next);
  };

  const activeCount = Object.values(filters).filter((v) => v !== null && v !== "").length;

  const clearAll = () => {
    setFilters(defaultFilters);
    onFiltersChange?.(defaultFilters);
  };

  const Select = ({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string | null; onChange: (v: string) => void }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</label>
      <select
        value={value ?? "All"}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-white/[0.06] bg-zinc-800/50 px-3 py-2 text-[13px] text-zinc-200 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
        aria-label={`Filter by ${label.toLowerCase()}`}
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-zinc-800">{opt}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" />
          <span className="text-[13px] text-zinc-400">Filters</span>
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 text-[11px] text-gold">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 rounded-lg border border-white/[0.06] px-2.5 py-1.5 text-[12px] text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white"
              aria-label="Clear all filters"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-zinc-900/50 px-2.5 py-1.5 text-[12px] text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white"
            aria-label={showMore ? "Show fewer filters" : "Show more filters"}
            aria-expanded={showMore}
          >
            {showMore ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {showMore ? "Less Filters" : `More Filters ${activeCount > 7 ? `(+${activeCount - 7})` : ""}`}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Select label="Region" options={["All", ...MOCK_REGIONS]} value={filters.region} onChange={(v) => set("region", v)} />
        <Select label="Country" options={["All", ...MOCK_COUNTRIES]} value={filters.country} onChange={(v) => set("country", v)} />
        <Select label="Legal Entity" options={["All", ...MOCK_ENTITIES]} value={filters.legalEntity} onChange={(v) => set("legalEntity", v)} />
        <Select label="Bank" options={["All", ...MOCK_BANKS]} value={filters.bank} onChange={(v) => set("bank", v)} />
        <Select label="Currency" options={["All", ...MOCK_CURRENCIES]} value={filters.currency} onChange={(v) => set("currency", v)} />
        <Select label="Account Type" options={ACCOUNT_TYPES} value={filters.accountType} onChange={(v) => set("accountType", v)} />
        <Select label="Ownership" options={OWNERSHIP} value={filters.ownership} onChange={(v) => set("ownership", v)} />
      </div>

      {showMore && (
        <div className="flex flex-wrap items-end gap-3 pt-1">
          <Select label="Lifecycle" options={LIFECYCLES} value={filters.lifecycleStatus} onChange={(v) => set("lifecycleStatus", v)} />
          <Select label="Status" options={STATUSES} value={filters.accountStatus} onChange={(v) => set("accountStatus", v)} />
          <Select label="KYC Status" options={KYCS} value={filters.kycStatus} onChange={(v) => set("kycStatus", v)} />
          <Select label="Mandate Status" options={MANDATES} value={filters.mandateStatus} onChange={(v) => set("mandateStatus", v)} />
          <Select label="Risk Level" options={RISKS} value={filters.riskLevel} onChange={(v) => set("riskLevel", v)} />
        </div>
      )}
    </div>
  );
}
