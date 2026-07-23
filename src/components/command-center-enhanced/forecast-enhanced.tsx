"use client";

import { GlassCard } from "@/components/enterprise/glass-panel";
import { TrendChart } from "@/components/enterprise/visualizations/trend-chart";
import { AnimatedCounter } from "@/components/enterprise/animated-counter";
import type { CommandCenterData } from "@/modules/command-center/command-center.service";

interface ForecastEnhancedProps {
  data: CommandCenterData["forecasts"];
  className?: string;
}

export function ForecastCenterEnhanced({ data, className }: ForecastEnhancedProps) {
  const cfConfidence = data.cashFlowConfidence ?? 0;
  const liqConfidence = data.liquidityConfidence ?? 0;
  const hasData = cfConfidence > 0 || liqConfidence > 0;

  return (
    <GlassCard
      title="Forecast Center"
      description={`Horizons: ${data.forecastHorizons.join(", ")}`}
      variant="default"
      className={className}
      headerClassName="border-b border-white/[0.04] pb-3"
    >
      <div className="space-y-4">
        {/* Confidence gauges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Cash Flow</span>
              <AnimatedCounter value={cfConfidence} suffix="%" className="text-sm font-bold text-emerald-400 tabular-nums" />
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500/60 to-emerald-400 transition-all duration-700"
                style={{ width: `${cfConfidence}%` }}
              />
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Liquidity</span>
              <AnimatedCounter value={liqConfidence} suffix="%" className="text-sm font-bold text-blue-400 tabular-nums" />
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500/60 to-blue-400 transition-all duration-700"
                style={{ width: `${liqConfidence}%` }}
              />
            </div>
          </div>
        </div>

        {/* Trend chart placeholder */}
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
          <p className="text-[10px] text-zinc-500 mb-2">Confidence Trend</p>
          <TrendChart
            lines={[
              { label: "Cash Flow", data: [cfConfidence, cfConfidence * 0.9, cfConfidence * 1.1, cfConfidence], color: "#34d399" },
              { label: "Liquidity", data: [liqConfidence, liqConfidence * 1.05, liqConfidence * 0.95, liqConfidence], color: "#60a5fa", dashed: true },
            ]}
            height={48}
            showLegend={false}
          />
        </div>

        {!hasData && (
          <p className="text-xs text-zinc-500 text-center">Forecast data unavailable. Enable data sources for projections.</p>
        )}
      </div>
    </GlassCard>
  );
}
