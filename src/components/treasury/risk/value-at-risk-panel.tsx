"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calculator,
  BookOpen,
  Sigma,
  LineChart,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { MOCK_VAR } from "./data";
import type { VaRCalculation } from "./types";

const GOLD = "#c9a84c";
const LATEST_VAR = MOCK_VAR[MOCK_VAR.length - 1];
const PREVIOUS_VAR = MOCK_VAR.length > 1 ? MOCK_VAR[MOCK_VAR.length - 2] : null;

function fmt(v: number): string {
  if (Math.abs(v) >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toFixed(0);
}

function varTrend(current: number, previous: number | null): "up" | "down" | "stable" {
  if (!previous) return "stable";
  const diff = ((current - previous) / previous) * 100;
  if (diff > 1) return "up";
  if (diff < -1) return "down";
  return "stable";
}

export function ValueAtRiskPanel({ className }: { className?: string }) {
  const v = LATEST_VAR;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5" style={{ color: GOLD }} aria-hidden="true" />
        <h2 className="text-lg font-semibold text-white">Value at Risk (VaR)</h2>
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-zinc-500" aria-hidden="true" />
            <span className="text-xs text-zinc-500">Portfolio Value</span>
            <span className="text-sm font-semibold text-white">${fmt(v.portfolioValue)}</span>
          </div>
          <span className="text-[11px] text-zinc-600">Updated: {v.date}</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <VaRMetricCard
            label="1-Day 95%"
            value={v.var1d95}
            previous={PREVIOUS_VAR?.var1d95 ?? null}
          />
          <VaRMetricCard
            label="1-Day 99%"
            value={v.var1d99}
            previous={PREVIOUS_VAR?.var1d99 ?? null}
          />
          <VaRMetricCard
            label="10-Day 95%"
            value={v.var10d95}
            previous={PREVIOUS_VAR?.var10d95 ?? null}
          />
          <VaRMetricCard
            label="10-Day 99%"
            value={v.var10d99}
            previous={PREVIOUS_VAR?.var10d99 ?? null}
          />
          <VaRMetricCard
            label="30-Day 95%"
            value={v.var30d95}
            previous={PREVIOUS_VAR?.var30d95 ?? null}
          />
          <VaRMetricCard
            label="30-Day 99%"
            value={v.var30d99}
            previous={PREVIOUS_VAR?.var30d99 ?? null}
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Sigma className="h-4 w-4" style={{ color: GOLD }} aria-hidden="true" />
          <h3 className="text-sm font-medium text-white">Methodology Comparison</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <MethodCard
            icon={BookOpen}
            label="Historical"
            value={v.historicalVar}
            description="Uses actual historical returns ranked by percentile"
          />
          <MethodCard
            icon={Sigma}
            label="Parametric"
            value={v.parametricVar}
            description="Assumes normal distribution of returns"
          />
          <MethodCard
            icon={Activity}
            label="Monte Carlo"
            value={v.monteCarloVar}
            description="10,000 simulated paths with stochastic modeling"
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" style={{ color: GOLD }} aria-hidden="true" />
          <h3 className="text-sm font-medium text-white">VaR Trend (1-Day 95%)</h3>
        </div>
        <div className="flex items-end gap-1.5 h-24">
          {MOCK_VAR.slice(-10).map((point: VaRCalculation, idx: number, arr: VaRCalculation[]) => {
            const maxHistoric = Math.max(...arr.map((p: VaRCalculation) => p.var1d95), 1);
            const height = (point.var1d95 / maxHistoric) * 100;
            return (
              <div key={point.id} className="group relative flex flex-1 flex-col items-center justify-end">
                <div className="absolute -top-6 hidden group-hover:block whitespace-nowrap rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-200">
                  ${fmt(point.var1d95)}
                </div>
                <div
                  className={cn(
                    "w-full rounded-t transition-all duration-200",
                    point.var1d95 > arr[0].var1d95 * 1.1 ? "bg-red-500/60" : point.var1d95 < arr[0].var1d95 * 0.9 ? "bg-emerald-500/60" : "bg-amber-500/40"
                  )}
                  style={{ height: `${height}%`, minHeight: "4px" }}
                  role="progressbar"
                  aria-valuenow={point.var1d95}
                  aria-valuemin={0}
                  aria-valuemax={maxHistoric}
                  aria-label={`VaR $${fmt(point.var1d95)} on ${point.date}`}
                />
                <span className="mt-1 text-[8px] text-zinc-600">{point.date.slice(5)}</span>
              </div>
    );
  })}

        </div>
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-zinc-500" aria-hidden="true" />
          <p className="text-[11px] text-zinc-500">{v.methodology}</p>
        </div>
      </div>
    </div>
  );
}

function VaRMetricCard({ label, value, previous }: { label: string; value: number; previous: number | null }) {
  const trend = varTrend(value, previous);
  const isHigher = previous !== null && value > previous;
  const isLower = previous !== null && value < previous;
  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-800/50 p-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
        {trend !== "stable" && (
          trend === "up" ? (
          <TrendingUp className="h-3 w-3 text-red-400" aria-hidden="true" />
        ) : (
          <TrendingDown className="h-3 w-3 text-emerald-400" aria-hidden="true" />
        ))}
      </div>
      <p className={cn(
        "mt-1 text-lg font-semibold",
        isHigher ? "text-red-300" : isLower ? "text-emerald-300" : "text-white"
      )}>
        ${fmt(value)}
      </p>
    </div>
  );
}

function MethodCard({ icon: Icon, label, value, description }: { icon: React.ElementType; label: string; value: number; description: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-800/50 p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color: GOLD }} aria-hidden="true" />
        <p className="text-xs font-medium text-white">{label}</p>
      </div>
      <p className="mt-1.5 text-lg font-semibold text-red-300">${fmt(value)}</p>
      <p className="mt-1 text-[10px] text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
}