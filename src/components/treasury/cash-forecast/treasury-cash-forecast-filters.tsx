"use client";

import { cn } from "@/lib/utils";
import { Filter, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { MOCK_ENTITIES, MOCK_REGIONS, MOCK_CURRENCIES } from "./data";

const FORECAST_HORIZONS = ["All", "Weekly", "Monthly", "Quarterly", "Annual"];
const SCENARIOS = ["All", "Base Case", "Optimistic", "Pessimistic", "Expansion", "Recession", "Acquisition", "Capital Raise", "FX Shock", "Interest Shock", "Supply Chain", "Customer Default", "Pandemic", "Custom"];
const BUSINESS_UNITS = ["All", "Corporate", "North America Ops", "Europe Ops", "Middle East Ops", "Africa Ops", "APAC Ops", "Treasury", "Finance"];
const FORECAST_TYPES = ["All", "Operating", "Investing", "Financing", "FX", "Tax"];
const CONFIDENCE_RANGES = ["All", "90-100%", "80-89%", "70-79%", "Below 70%"];
const RISK_LEVELS = ["All", "Low", "Medium", "High", "Critical"];
const LIQUIDITY_TIERS = ["All", "Excellent", "Good", "Adequate", "Warning", "Critical"];
const CASH_CATEGORIES = ["All", "Operating", "Investing", "Financing", "FX", "Tax"];
const DEPARTMENTS = ["All", "Finance", "Treasury", "Operations", "Sales", "Marketing", "R&D", "HR", "Legal"];
const DATE_RANGES = ["All", "Last 7 Days", "Last 30 Days", "Last Quarter", "This Year", "Custom Range"];
const STATUS_OPTIONS = ["All", "Draft", "Approved", "Locked", "Superseded"];
const OWNERS = ["All", "Alice Chen", "Bob Smith", "Carol Davis", "David Lee", "Eva Martinez", "Frank Wilson", "Grace Kim"];

interface TreasuryCashForecastFiltersProps {
  className?: string;
}

export function TreasuryCashForecastFilters({ className }: TreasuryCashForecastFiltersProps) {
  const [entity, setEntity] = useState("All");
  const [region, setRegion] = useState("All");
  const [currency, setCurrency] = useState("All");
  const [forecastHorizon, setForecastHorizon] = useState("All");
  const [scenario, setScenario] = useState("All");
  const [businessUnit, setBusinessUnit] = useState("All");
  const [forecastType, setForecastType] = useState("All");
  const [confidence, setConfidence] = useState("All");
  const [riskLevel, setRiskLevel] = useState("All");
  const [liquidityTier, setLiquidityTier] = useState("All");
  const [cashCategory, setCashCategory] = useState("All");
  const [department, setDepartment] = useState("All");
  const [dateRange, setDateRange] = useState("All");
  const [status, setStatus] = useState("All");
  const [owner, setOwner] = useState("All");
  const [showMore, setShowMore] = useState(false);

  const allFilters = [entity, region, currency, forecastHorizon, scenario, businessUnit, forecastType, confidence, riskLevel, liquidityTier, cashCategory, department, dateRange, status, owner];
  const activeFilters = allFilters.filter((f) => f !== "All").length;

  const primaryFilters = [entity, region, currency, forecastHorizon, scenario, businessUnit, forecastType];
  const primaryActive = primaryFilters.filter((f) => f !== "All").length;

  const clearAll = () => {
    setEntity("All"); setRegion("All"); setCurrency("All"); setForecastHorizon("All");
    setScenario("All"); setBusinessUnit("All"); setForecastType("All");
    setConfidence("All"); setRiskLevel("All"); setLiquidityTier("All");
    setCashCategory("All"); setDepartment("All"); setDateRange("All");
    setStatus("All"); setOwner("All");
  };

  const Select = ({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-white/[0.06] bg-zinc-800/50 px-3 py-2 text-[13px] text-zinc-200 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 min-w-[130px]"
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
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900/50 px-4 py-2.5 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white lg:hidden"
          aria-label={showMore ? "Hide filters" : "Show filters"}
          aria-expanded={showMore}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilters > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 text-[11px] text-gold">
              {activeFilters}
            </span>
          )}
        </button>

        <div className="hidden lg:flex flex-wrap items-end gap-3">
          <Select label="Entity" options={["All", ...MOCK_ENTITIES]} value={entity} onChange={setEntity} />
          <Select label="Region" options={["All", ...MOCK_REGIONS]} value={region} onChange={setRegion} />
          <Select label="Currency" options={["All", ...MOCK_CURRENCIES]} value={currency} onChange={setCurrency} />
          <Select label="Forecast Horizon" options={FORECAST_HORIZONS} value={forecastHorizon} onChange={setForecastHorizon} />
          <Select label="Scenario" options={SCENARIOS} value={scenario} onChange={setScenario} />
          <Select label="Business Unit" options={BUSINESS_UNITS} value={businessUnit} onChange={setBusinessUnit} />
          <Select label="Forecast Type" options={FORECAST_TYPES} value={forecastType} onChange={setForecastType} />
        </div>

        <button
          onClick={() => setShowMore(!showMore)}
          className="hidden lg:flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900/50 px-4 py-2.5 text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
          aria-label={showMore ? "Show fewer filters" : "Show more filters"}
          aria-expanded={showMore}
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", showMore && "rotate-180")} />
          <span>{showMore ? "Less" : "More"} Filters</span>
          {!showMore && activeFilters - primaryActive > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 text-[11px] text-gold">
              {activeFilters - primaryActive}
            </span>
          )}
        </button>

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

      {showMore && (
        <div className="flex flex-wrap items-end gap-3 p-4 rounded-lg border border-white/[0.06] bg-zinc-900/30">
          <Select label="Confidence" options={CONFIDENCE_RANGES} value={confidence} onChange={setConfidence} />
          <Select label="Risk Level" options={RISK_LEVELS} value={riskLevel} onChange={setRiskLevel} />
          <Select label="Liquidity Tier" options={LIQUIDITY_TIERS} value={liquidityTier} onChange={setLiquidityTier} />
          <Select label="Cash Category" options={CASH_CATEGORIES} value={cashCategory} onChange={setCashCategory} />
          <Select label="Department" options={DEPARTMENTS} value={department} onChange={setDepartment} />
          <Select label="Date Range" options={DATE_RANGES} value={dateRange} onChange={setDateRange} />
          <Select label="Status" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
          <Select label="Owner" options={OWNERS} value={owner} onChange={setOwner} />
        </div>
      )}
    </div>
  );
}
