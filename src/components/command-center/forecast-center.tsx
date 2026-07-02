"use client";

import { WidgetCard } from "./widget-card";
import type { CommandCenterData } from "@/modules/command-center/command-center.service";

export function ForecastCenterWidget({ data }: { data: CommandCenterData["forecasts"] }) {
  return (
    <WidgetCard title="Forecast Center" description={`Horizons: ${data.forecastHorizons.join(", ")}`}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-black/20 border border-white/[0.06] p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Cash Flow</p>
            <p className="text-lg font-bold text-white mt-0.5">{data.cashFlowConfidence}%</p>
            <div className="mt-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${data.cashFlowConfidence}%` }} />
            </div>
          </div>
          <div className="rounded-lg bg-black/20 border border-white/[0.06] p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Liquidity</p>
            <p className="text-lg font-bold text-white mt-0.5">{data.liquidityConfidence}%</p>
            <div className="mt-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${data.liquidityConfidence}%` }} />
            </div>
          </div>
        </div>
        {data.cashFlowConfidence === 0 && data.liquidityConfidence === 0 ? (
          <p className="text-xs text-zinc-500">Forecast data unavailable. Enable data sources for projections.</p>
        ) : (
          <p className="text-xs text-zinc-500">
            Model confidence based on available transaction history and trend analysis.
          </p>
        )}
      </div>
    </WidgetCard>
  );
}
