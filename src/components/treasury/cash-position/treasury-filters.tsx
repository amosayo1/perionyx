"use client";

import { cn } from "@/lib/utils";
import { Filter, X } from "lucide-react";
import { useState } from "react";

const REGIONS = ["All", "North America", "Europe", "Middle East", "Africa", "Asia-Pacific"];
const CURRENCIES = ["All", "USD", "EUR", "GBP", "AED", "ZAR", "JPY", "CHF", "SGD", "CAD", "AUD"];
const ENTITIES = ["All", "Perionyx Inc.", "Perionyx LLC", "Perionyx UK Ltd.", "Perionyx EU B.V.", "Perionyx Middle East LLC", "Perionyx Africa Pty Ltd.", "Perionyx APAC Pte Ltd."];
const INSTITUTIONS = ["All", "JPMorgan Chase", "Bank of America", "Barclays", "HSBC Holdings", "First Abu Dhabi Bank", "Emirates NBD", "Nedbank", "Standard Bank", "Mitsubishi UFJ", "DBS Bank", "UBS", "Citi"];
const CASH_TYPES = ["All", "Operating", "Treasury", "Payroll", "Tax", "Investment", "Reserve", "Restricted", "Escrow", "Collateral"];

interface TreasuryFiltersProps {
  className?: string;
}

export function TreasuryFilters({ className }: TreasuryFiltersProps) {
  const [region, setRegion] = useState("All");
  const [currency, setCurrency] = useState("All");
  const [entity, setEntity] = useState("All");
  const [institution, setInstitution] = useState("All");
  const [cashType, setCashType] = useState("All");
  const [isOpen, setIsOpen] = useState(false);

  const activeFilters = [region, currency, entity, institution, cashType].filter((f) => f !== "All").length;

  const clearAll = () => {
    setRegion("All");
    setCurrency("All");
    setEntity("All");
    setInstitution("All");
    setCashType("All");
  };

  const Select = ({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</label>
      <select
        value={value}
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900/50 px-4 py-2.5 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white lg:hidden"
        aria-label={isOpen ? "Hide filters" : "Show filters"}
        aria-expanded={isOpen}
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeFilters > 0 && (
          <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 text-[11px] text-gold">
            {activeFilters}
          </span>
        )}
      </button>

      <div className={cn(
        "flex flex-wrap items-end gap-3",
        !isOpen && "hidden lg:flex",
      )}>
        <Select label="Region" options={REGIONS} value={region} onChange={setRegion} />
        <Select label="Currency" options={CURRENCIES} value={currency} onChange={setCurrency} />
        <Select label="Entity" options={ENTITIES} value={entity} onChange={setEntity} />
        <Select label="Institution" options={INSTITUTIONS} value={institution} onChange={setInstitution} />
        <Select label="Cash Type" options={CASH_TYPES} value={cashType} onChange={setCashType} />

        {activeFilters > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 rounded-lg border border-white/[0.06] px-3 py-2 text-[12px] text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white"
            aria-label="Clear all filters"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
