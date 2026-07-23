"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedButton } from "@/components/enterprise/motion/animated-button";
import type { ReportConfig, ComparisonType } from "@/modules/financial-reporting/types";
import { Calendar, Filter, RotateCcw } from "lucide-react";

interface ReportFiltersProps {
  config: ReportConfig;
  onChange: (config: ReportConfig) => void;
}

const datePresets = [
  { label: "This Month", getValue: () => { const n = new Date(); return { start: new Date(n.getFullYear(), n.getMonth(), 1).toISOString().split("T")[0], end: n.toISOString().split("T")[0] }; } },
  { label: "Last Month", getValue: () => { const n = new Date(); return { start: new Date(n.getFullYear(), n.getMonth() - 1, 1).toISOString().split("T")[0], end: new Date(n.getFullYear(), n.getMonth(), 0).toISOString().split("T")[0] }; } },
  { label: "This Quarter", getValue: () => { const n = new Date(); const q = Math.floor(n.getMonth() / 3); return { start: new Date(n.getFullYear(), q * 3, 1).toISOString().split("T")[0], end: n.toISOString().split("T")[0] }; } },
  { label: "Last Quarter", getValue: () => { const n = new Date(); const q = Math.floor(n.getMonth() / 3) - 1; const y = q < 0 ? n.getFullYear() - 1 : n.getFullYear(); const m = ((q % 3) + 3) % 3 * 3; return { start: new Date(y, m, 1).toISOString().split("T")[0], end: new Date(y, m + 3, 0).toISOString().split("T")[0] }; } },
  { label: "This Year", getValue: () => { const n = new Date(); return { start: new Date(n.getFullYear(), 0, 1).toISOString().split("T")[0], end: n.toISOString().split("T")[0] }; } },
  { label: "Last Year", getValue: () => { const n = new Date(); return { start: new Date(n.getFullYear() - 1, 0, 1).toISOString().split("T")[0], end: new Date(n.getFullYear() - 1, 11, 31).toISOString().split("T")[0] }; } },
];

const currencies = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "CNY", "BRL", "INR"];

const comparisons: { label: string; value: ComparisonType }[] = [
  { label: "None", value: "none" },
  { label: "Prior Period", value: "prior-period" },
  { label: "Prior Year", value: "prior-year" },
  { label: "Budget", value: "budget" },
];

export function ReportFilters({ config, onChange }: ReportFiltersProps) {
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const handlePreset = useCallback((preset: typeof datePresets[0]) => {
    const { start, end } = preset.getValue();
    setActivePreset(preset.label);
    onChange({ ...config, dateRange: { ...config.dateRange, start, end } });
  }, [config, onChange]);

  const handleReset = useCallback(() => {
    setActivePreset(null);
    onChange({
      ...config,
      dateRange: { start: "", end: "" },
      companyIds: [],
      departmentIds: [],
      costCenterIds: [],
      currency: "USD",
      comparison: "none",
      showZeroBalances: false,
      compact: false,
      rounding: 2,
    });
  }, [config, onChange]);

  return (
    <div className="space-y-4 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" />
          <span className="text-sm font-medium text-zinc-200">Filters</span>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-medium text-zinc-500">Date Presets</p>
        <div className="flex flex-wrap gap-1.5">
          {datePresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePreset(preset)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
                activePreset === preset.label
                  ? "bg-amber-400/10 text-amber-400"
                  : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="rf-start" className="mb-1 block text-[11px] text-zinc-500">Start Date</label>
          <input
            id="rf-start"
            type="date"
            value={config.dateRange.start}
            onChange={(e) => onChange({ ...config, dateRange: { ...config.dateRange, start: e.target.value } })}
            className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
          />
        </div>
        <div>
          <label htmlFor="rf-end" className="mb-1 block text-[11px] text-zinc-500">End Date</label>
          <input
            id="rf-end"
            type="date"
            value={config.dateRange.end}
            onChange={(e) => onChange({ ...config, dateRange: { ...config.dateRange, end: e.target.value } })}
            className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="rf-currency" className="mb-1 block text-[11px] text-zinc-500">Currency</label>
          <select
            id="rf-currency"
            value={config.currency}
            onChange={(e) => onChange({ ...config, currency: e.target.value })}
            className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
          >
            {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="rf-comparison" className="mb-1 block text-[11px] text-zinc-500">Comparison</label>
          <select
            id="rf-comparison"
            value={config.comparison}
            onChange={(e) => onChange({ ...config, comparison: e.target.value as ComparisonType })}
            className="w-full rounded-lg border border-white/[0.1] bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
          >
            {comparisons.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <input
            type="checkbox"
            checked={config.showZeroBalances}
            onChange={(e) => onChange({ ...config, showZeroBalances: e.target.checked })}
            className="rounded border-zinc-700 bg-zinc-800 text-amber-400"
          />
          Show Zero Balances
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <input
            type="checkbox"
            checked={config.compact}
            onChange={(e) => onChange({ ...config, compact: e.target.checked })}
            className="rounded border-zinc-700 bg-zinc-800 text-amber-400"
          />
          Compact View
        </label>
        <div>
          <label htmlFor="rf-rounding" className="mr-1 text-[11px] text-zinc-500">Rounding:</label>
          <select
            id="rf-rounding"
            value={config.rounding}
            onChange={(e) => onChange({ ...config, rounding: parseInt(e.target.value) })}
            className="rounded-lg border border-white/[0.1] bg-zinc-950 px-2 py-1 text-[11px] text-white"
          >
            <option value={0}>0</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={4}>4</option>
          </select>
        </div>
      </div>

      <AnimatedButton variant="primary" className="w-full text-xs">
        Apply Filters
      </AnimatedButton>
    </div>
  );
}
