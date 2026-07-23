"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus, BarChart3, Layers, Clock, AlertTriangle } from "lucide-react";
import { MOCK_ASSUMPTIONS } from "./data";
import type { ForecastAssumption } from "./types";

const CATEGORY_LABELS: Record<string, string> = {
  revenue_growth: "Revenue Growth",
  expense_growth: "Expense Growth",
  fx_rates: "FX Rates",
  inflation: "Inflation",
  interest_rates: "Interest Rates",
  tax: "Tax",
  working_capital: "Working Capital",
  collection_days: "Collection Days",
  payment_days: "Payment Days",
  capex: "Capital Expenditure",
  hiring: "Hiring & Compensation",
  seasonality: "Seasonality",
};

function fmtVal(v: number): string {
  if (Math.abs(v) >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  if (Math.abs(v) >= 1) return v.toFixed(1);
  return v.toFixed(2);
}

function trendIcon(t: "up" | "down" | "stable") {
  const styles = {
    up: "text-green-400",
    down: "text-red-400",
    stable: "text-zinc-500",
  };
  const icons = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
  };
  const Icon = icons[t];
  return <Icon className={cn("h-3.5 w-3.5", styles[t])} />;
}

function sensitivityBadge(s: "low" | "medium" | "high") {
  const styles = {
    low: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    medium: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    high: "border-red-500/30 text-red-400 bg-red-500/10",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium", styles[s])}>
      {s}
    </span>
  );
}

function CategorySection({ category, assumptions }: { category: string; assumptions: ForecastAssumption[] }) {
  const [open, setOpen] = useState(true);
  const changes = assumptions.filter((a) => a.trend !== "stable").length;
  const highSens = assumptions.filter((a) => a.sensitivity === "high").length;

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
        aria-expanded={open}
        aria-label={`${CATEGORY_LABELS[category] || category} section`}
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4 text-zinc-400" /> : <ChevronRight className="h-4 w-4 text-zinc-400" />}
          <span className="text-sm font-medium text-white">{CATEGORY_LABELS[category] || category}</span>
          <span className="text-[11px] text-zinc-500">({assumptions.length})</span>
        </div>
        <div className="flex items-center gap-3">
          {changes > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-amber-400">
              <TrendingUp className="h-3 w-3" />
              {changes} changed
            </span>
          )}
          {highSens > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-red-400">
              <AlertTriangle className="h-3 w-3" />
              {highSens} high
            </span>
          )}
        </div>
      </button>
      {open && (
        <div className="border-t border-white/[0.06]">
          <table className="w-full" role="table">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-2 text-left font-medium">Assumption</th>
                <th className="px-4 py-2 text-right font-medium">Current</th>
                <th className="px-4 py-2 text-right font-medium">Previous</th>
                <th className="px-4 py-2 text-center font-medium">Change</th>
                <th className="px-4 py-2 text-center font-medium">Trend</th>
                <th className="px-4 py-2 text-right font-medium">Confidence</th>
                <th className="px-4 py-2 text-left font-medium">Source</th>
                <th className="px-4 py-2 text-right font-medium">Updated</th>
                <th className="px-4 py-2 text-center font-medium">Sensitivity</th>
              </tr>
            </thead>
            <tbody>
              {assumptions.map((a) => (
                <tr key={a.id} className="border-t border-white/[0.03] text-[13px] hover:bg-white/[0.02]">
                  <td className="px-4 py-2 text-zinc-200">{a.name}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-zinc-200 font-medium">{fmtVal(a.currentValue)}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-zinc-500">{fmtVal(a.previousValue)}</td>
                  <td className={cn("px-4 py-2 text-right tabular-nums font-medium", a.change >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {a.change >= 0 ? "+" : ""}{a.changePercent.toFixed(1)}%
                  </td>
                  <td className="px-4 py-2 text-center">{trendIcon(a.trend)}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-zinc-300">
                    <div className="inline-flex items-center gap-1.5">
                      <div className="h-1.5 w-12 rounded-full bg-zinc-800">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            a.confidence >= 80 ? "bg-emerald-500/60" : a.confidence >= 60 ? "bg-amber-500/60" : "bg-red-500/60",
                          )}
                          style={{ width: `${a.confidence}%` }}
                          role="progressbar"
                          aria-valuenow={a.confidence}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                      <span className="text-[11px]">{a.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-zinc-400 text-[12px]">{a.source}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-zinc-400 text-[12px]">{a.lastUpdated}</td>
                  <td className="px-4 py-2 text-center">{sensitivityBadge(a.sensitivity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ForecastAssumptionsPanel({ className }: { className?: string }) {
  const grouped: Record<string, ForecastAssumption[]> = {};
  for (const a of MOCK_ASSUMPTIONS) {
    if (!grouped[a.category]) grouped[a.category] = [];
    grouped[a.category].push(a);
  }

  const categories = Object.keys(CATEGORY_LABELS).filter((c) => grouped[c]);
  const totalChanges = MOCK_ASSUMPTIONS.filter((a) => a.trend !== "stable").length;
  const highSensitivityCount = MOCK_ASSUMPTIONS.filter((a) => a.sensitivity === "high").length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard icon={BarChart3} label="Total Assumptions" value={String(MOCK_ASSUMPTIONS.length)} />
        <SummaryCard icon={Layers} label="Categories" value={String(categories.length)} />
        <SummaryCard icon={TrendingUp} label="Changes This Period" value={String(totalChanges)} sub={totalChanges === 1 ? "assumption" : "assumptions"} />
        <SummaryCard icon={AlertTriangle} label="High Sensitivity" value={String(highSensitivityCount)} sub={highSensitivityCount === 1 ? "assumption" : "assumptions"} />
      </div>

      <div className="space-y-2">
        {categories.map((cat) => (
          <CategorySection key={cat} category={cat} assumptions={grouped[cat]} />
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3">
      <div className="flex items-center gap-1.5 text-zinc-500">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
      {sub && <p className="text-[11px] text-zinc-500">{sub}</p>}
    </div>
  );
}
