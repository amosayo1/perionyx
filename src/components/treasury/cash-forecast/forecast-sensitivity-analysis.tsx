"use client";

import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, AlertTriangle, TrendingUp, BarChart3, Gauge } from "lucide-react";
import { MOCK_SENSITIVITY } from "./data";

const IMPACT_RANGES = [
  { label: "-$2M+", min: -Infinity, max: -2000000 },
  { label: "-$1M–$2M", min: -2000000, max: -1000000 },
  { label: "-$500K–$1M", min: -1000000, max: -500000 },
  { label: "-$0–$500K", min: -500000, max: 0 },
  { label: "$0–$500K", min: 0, max: 500000 },
  { label: "$500K–$1M", min: 500000, max: 1000000 },
  { label: "$1M–$2M", min: 1000000, max: 2000000 },
  { label: "$2M+", min: 2000000, max: Infinity },
];

function fmt(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${v >= 0 ? "+" : "-"}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${v >= 0 ? "+" : "-"}$${(abs / 1_000).toFixed(0)}K`;
  return `${v >= 0 ? "+" : "-"}$${abs.toFixed(0)}`;
}

function sensitivityBadge(s: "low" | "medium" | "high") {
  const styles = {
    low: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    medium: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    high: "border-red-500/30 text-red-400 bg-red-500/10",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", styles[s])}>
      {s}
    </span>
  );
}

export function ForecastSensitivityAnalysis({ className }: { className?: string }) {
  const sorted = [...MOCK_SENSITIVITY].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  const maxAbsImpact = Math.max(...sorted.map((s) => Math.abs(s.impact)));
  const totalImpact = sorted.reduce((sum, s) => sum + s.impact, 0);
  const highestProb = sorted.reduce((best, s) => (s.probability > best.probability ? s : best));
  const mostSensitive = sorted[0];

  return (
    <div className={cn("space-y-5", className)}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <Gauge className="h-4 w-4" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Most Sensitive Variable</span>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-white">{mostSensitive.variable}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className={cn("text-sm font-medium", mostSensitive.impact >= 0 ? "text-emerald-400" : "text-red-400")}>
              {fmt(mostSensitive.impact)}
            </span>
            {sensitivityBadge(mostSensitive.sensitivity)}
          </div>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <BarChart3 className="h-4 w-4" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Potential Impact</span>
          </div>
          <p className={cn("mt-1.5 text-lg font-semibold", totalImpact >= 0 ? "text-emerald-400" : "text-red-400")}>
            {fmt(totalImpact)}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500">Net across all variables</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <TrendingUp className="h-4 w-4" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Highest Probability</span>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-white">{highestProb.variable}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-200">{highestProb.probability}%</span>
            {sensitivityBadge(highestProb.sensitivity)}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3 text-left font-medium">Variable</th>
                <th className="px-4 py-3 text-right font-medium">Impact</th>
                <th className="px-4 py-3 text-right font-medium">Probability</th>
                <th className="px-4 py-3 text-center font-medium">Sensitivity</th>
                <th className="px-4 py-3 text-center font-medium">Direction</th>
                <th className="px-4 py-3 text-left font-medium">Impact Bar</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => {
                const barWidth = (Math.abs(s.impact) / maxAbsImpact) * 100;
                return (
                  <tr key={s.variable} className="border-b border-white/[0.03] text-[13px] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-zinc-200">{s.variable}</td>
                    <td className={cn("px-4 py-3 text-right font-medium tabular-nums", s.impact >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {fmt(s.impact)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-300">{s.probability}%</td>
                    <td className="px-4 py-3 text-center">{sensitivityBadge(s.sensitivity)}</td>
                    <td className="px-4 py-3 text-center">
                      {s.direction === "positive" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <ArrowUp className="h-3.5 w-3.5" />
                          <span className="text-[11px] font-medium">Positive</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400">
                          <ArrowDown className="h-3.5 w-3.5" />
                          <span className="text-[11px] font-medium">Negative</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-2 rounded-full bg-zinc-800">
                        <div
                          className={cn("h-full rounded-full transition-all", s.impact >= 0 ? "bg-emerald-500/60" : "bg-red-500/60")}
                          style={{ width: `${barWidth}%` }}
                          role="progressbar"
                          aria-valuenow={barWidth}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4">
        <div className="flex items-center gap-2 text-zinc-500 mb-3">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-[11px] font-medium uppercase tracking-wider">Heat Map — Variables × Impact Ranges</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]" role="grid">
            <thead>
              <tr>
                <th className="px-2 py-1.5 text-left font-medium text-zinc-500">Variable</th>
                {IMPACT_RANGES.map((r) => (
                  <th key={r.label} className="px-2 py-1.5 text-center font-medium text-zinc-500">{r.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => {
                const varImpactAbs = Math.abs(s.impact);
                const rangeIdx = IMPACT_RANGES.findIndex((r) => varImpactAbs > r.min && varImpactAbs <= r.max);
                const intensity = MOCK_SENSITIVITY.indexOf(s) < 4 ? 0.8 : MOCK_SENSITIVITY.indexOf(s) < 8 ? 0.5 : 0.25;
                return (
                  <tr key={s.variable} className="border-t border-white/[0.03]">
                    <td className="px-2 py-1.5 text-zinc-300">{s.variable}</td>
                    {IMPACT_RANGES.map((_, ci) => {
                      const active = ci === rangeIdx;
                      return (
                        <td
                          key={ci}
                          className={cn(
                            "px-2 py-1.5 text-center transition-colors",
                            active && s.impact >= 0 ? "bg-emerald-500/20" : active ? "bg-red-500/20" : "bg-transparent",
                          )}
                          style={active ? { opacity: intensity + 0.2 } : undefined}
                        >
                          {active ? (
                            <span className={cn("font-medium", s.impact >= 0 ? "text-emerald-400" : "text-red-400")}>
                              {s.direction === "positive" ? "+" : "-"}
                            </span>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
