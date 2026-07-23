"use client";

import { cn } from "@/lib/utils";
import { Filter, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { MOCK_COUNTRIES, MOCK_CURRENCIES, MOCK_COUNTERPARTIES, MOCK_ENTITIES } from "./data";

const REGIONS = ["All Regions", "North America", "Europe", "Middle East", "Africa", "Asia-Pacific", "Latin America", "Oceania"];
const COUNTRIES = ["All Countries", ...MOCK_COUNTRIES];
const CURRENCIES = ["All Currencies", ...MOCK_CURRENCIES];
const COUNTERPARTIES = ["All Counterparties", ...MOCK_COUNTERPARTIES];
const RISK_TYPES = ["All Risks", "FX", "Interest Rate", "Counterparty", "Country", "Concentration", "Liquidity", "Hedging", "Operational"];
const ENTITIES = ["All Entities", ...MOCK_ENTITIES];
const SEVERITIES = ["All Severities", "Low", "Medium", "High", "Critical", "Emergency"];
const POLICIES = ["All Policies", "FX Exposure Limit", "Counterparty Credit Limit", "Concentration Limit", "Country Exposure Limit", "Hedge Coverage Minimum", "Interest Rate Limit", "VaR Limit"];
const DATE_RANGES = ["All Dates", "Today", "This Week", "This Month", "Last 30 Days", "This Quarter", "This Year", "Custom"];
const STATUSES = ["All Statuses", "Compliant", "Breached", "Pending Review", "Active", "Expiring", "Exhausted"];

export function TreasuryRiskFilters({ className }: { className?: string }) {
  const [region, setRegion] = useState("All Regions");
  const [country, setCountry] = useState("All Countries");
  const [currency, setCurrency] = useState("All Currencies");
  const [counterparty, setCounterparty] = useState("All Counterparties");
  const [riskType, setRiskType] = useState("All Risks");
  const [entity, setEntity] = useState("All Entities");
  const [severity, setSeverity] = useState("All Severities");
  const [policy, setPolicy] = useState("All Policies");
  const [date, setDate] = useState("All Dates");
  const [status, setStatus] = useState("All Statuses");
  const [showMore, setShowMore] = useState(false);

  const primary = [region, country, currency, counterparty, riskType, entity];
  const secondary = [severity, policy, date, status];
  const allFilters = [...primary, ...secondary];
  const active = allFilters.filter((f) => !f.startsWith("All")).length;

  const clearAll = () => {
    setRegion("All Regions"); setCountry("All Countries"); setCurrency("All Currencies");
    setCounterparty("All Counterparties"); setRiskType("All Risks"); setEntity("All Entities");
    setSeverity("All Severities"); setPolicy("All Policies"); setDate("All Dates"); setStatus("All Statuses");
  };

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
      <button onClick={() => setShowMore(!showMore)}
        className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900/50 px-4 py-2.5 text-[13px] text-zinc-300 hover:border-zinc-600 hover:text-white lg:hidden"
        aria-label={showMore ? "Hide filters" : "Show filters"} aria-expanded={showMore}>
        <Filter className="h-4 w-4" /> Filters
        {active > 0 && <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#c9a84c]/20 text-[11px] text-[#c9a84c]">{active}</span>}
      </button>
      <div className={cn("flex flex-wrap items-end gap-3", !showMore && "hidden lg:flex")}>
        <Select label="Region" options={REGIONS} value={region} onChange={setRegion} />
        <Select label="Country" options={COUNTRIES} value={country} onChange={setCountry} />
        <Select label="Currency" options={CURRENCIES} value={currency} onChange={setCurrency} />
        <Select label="Counterparty" options={COUNTERPARTIES} value={counterparty} onChange={setCounterparty} />
        <Select label="Risk Type" options={RISK_TYPES} value={riskType} onChange={setRiskType} />
        <Select label="Entity" options={ENTITIES} value={entity} onChange={setEntity} />
        {showMore && (
          <>
            <Select label="Severity" options={SEVERITIES} value={severity} onChange={setSeverity} />
            <Select label="Policy" options={POLICIES} value={policy} onChange={setPolicy} />
            <Select label="Date" options={DATE_RANGES} value={date} onChange={setDate} />
            <Select label="Status" options={STATUSES} value={status} onChange={setStatus} />
          </>
        )}
        <button onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-1 rounded-lg border border-white/[0.06] px-3 py-2 text-[12px] text-zinc-400 hover:border-zinc-600 hover:text-white hidden lg:flex" aria-label={showMore ? "Hide more filters" : "Show more filters"}>
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showMore && "rotate-180")} />
          {showMore ? "Less" : `${secondary.length} More`}
          {!showMore && active > 0 && <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c9a84c]/20 text-[10px] text-[#c9a84c]">{active}</span>}
        </button>
        {active > 0 && (
          <button onClick={clearAll} className="flex items-center gap-1 rounded-lg border border-white/[0.06] px-3 py-2 text-[12px] text-zinc-400 hover:border-zinc-600 hover:text-white" aria-label="Clear all filters">
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
