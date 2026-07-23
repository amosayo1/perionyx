"use client";

import { cn } from "@/lib/utils";
import { Filter, X } from "lucide-react";
import { useState } from "react";

const REGIONS = ["All Regions", "North America", "Europe", "Middle East", "Africa", "Asia-Pacific", "Latin America", "Oceania", "Africa (North)"];
const ENTITIES = ["All Entities", "Perionyx Inc.", "Perionyx LLC", "Perionyx UK Ltd.", "Perionyx EU B.V.", "Perionyx Middle East LLC", "Perionyx Africa Pty Ltd.", "Perionyx APAC Pte Ltd.", "Perionyx LatAm S.A.", "Perionyx Oceania Ltd.", "Perionyx North Africa SARL", "Perionyx Asia Ltd.", "Perionyx Gulf LLC"];
const CURRENCIES = ["All Currencies", "USD", "EUR", "GBP", "AED", "ZAR", "SGD", "BRL", "AUD", "MAD", "CNY", "CHF", "JPY", "CAD"];
const POOLS = ["All Pools", "Operating Pool", "Reserve Pool", "Strategic Pool", "Investment Pool", "Restricted Pool", "Emergency Pool"];
const HORIZONS = ["All Horizons", "Today", "7 Days", "30 Days", "90 Days", "180 Days", "365 Days"];

export function TreasuryLiquidityFilters({ className }: { className?: string }) {
  const [region, setRegion] = useState("All Regions");
  const [entity, setEntity] = useState("All Entities");
  const [currency, setCurrency] = useState("All Currencies");
  const [pool, setPool] = useState("All Pools");
  const [horizon, setHorizon] = useState("All Horizons");
  const [isOpen, setIsOpen] = useState(false);

  const active = [region, entity, currency, pool, horizon].filter((f) => !f.startsWith("All")).length;
  const clearAll = () => { setRegion("All Regions"); setEntity("All Entities"); setCurrency("All Currencies"); setPool("All Pools"); setHorizon("All Horizons"); };

  const Select = ({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-white/[0.06] bg-zinc-800/50 px-3 py-2 text-[13px] text-zinc-200 outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/20" aria-label={`Filter by ${label.toLowerCase()}`}>
        {options.map((o) => <option key={o} value={o} className="bg-zinc-800">{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className={cn("space-y-3", className)}>
      <button onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900/50 px-4 py-2.5 text-[13px] text-zinc-300 hover:border-zinc-600 hover:text-white lg:hidden"
        aria-label={isOpen ? "Hide filters" : "Show filters"} aria-expanded={isOpen}>
        <Filter className="h-4 w-4" /> Filters
        {active > 0 && <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#c9a84c]/20 text-[11px] text-[#c9a84c]">{active}</span>}
      </button>
      <div className={cn("flex flex-wrap items-end gap-3", !isOpen && "hidden lg:flex")}>
        <Select label="Region" options={REGIONS} value={region} onChange={setRegion} />
        <Select label="Entity" options={ENTITIES} value={entity} onChange={setEntity} />
        <Select label="Currency" options={CURRENCIES} value={currency} onChange={setCurrency} />
        <Select label="Pool" options={POOLS} value={pool} onChange={setPool} />
        <Select label="Horizon" options={HORIZONS} value={horizon} onChange={setHorizon} />
        {active > 0 && (
          <button onClick={clearAll} className="flex items-center gap-1 rounded-lg border border-white/[0.06] px-3 py-2 text-[12px] text-zinc-400 hover:border-zinc-600 hover:text-white" aria-label="Clear all filters">
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
