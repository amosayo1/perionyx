"use client";

import { useState, useMemo, memo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ForecastChart } from "./forecast-chart";
import type { AIForecast } from "./ai-types";

interface ForecastDashboardProps {
  forecasts: AIForecast[];
  className?: string;
}

export const ForecastDashboard = memo(function ForecastDashboard({ forecasts, className }: ForecastDashboardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const latest = useMemo(() => {
    const grouped = new Map<string, AIForecast>();
    for (const f of forecasts) {
      const key = `${f.domain}:${f.metric}`;
      const existing = grouped.get(key);
      if (!existing || f.createdAt > existing.createdAt) {
        grouped.set(key, f);
      }
    }
    return Array.from(grouped.values());
  }, [forecasts]);

  const activeForecast = selected
    ? forecasts.find(f => f.id === selected)
    : latest.length > 0 ? latest[0] : null;

  if (forecasts.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40 py-12", className)}>
        <div className="text-center">
          <TrendingUp className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="mt-2 text-sm text-zinc-500">No forecasts available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-3 gap-4", className)}>
      <div className="space-y-2">
        <h3 className="flex items-center gap-2 text-xs font-semibold text-zinc-400">Forecasts</h3>
        {latest.map(f => (
          <button
            key={f.id}
            onClick={() => setSelected(f.id)}
            className={cn(
              "w-full rounded-lg border px-3 py-2 text-left transition-colors",
              activeForecast?.id === f.id
                ? "border-[#d4af37]/30 bg-[#d4af37]/10"
                : "border-zinc-800/60 bg-zinc-900/40 hover:border-zinc-700/60"
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-white">{f.metric.replace(/-/g, " ")}</p>
              {f.trend === "increasing" && <TrendingUp className="h-3 w-3 text-emerald-400" />}
              {f.trend === "decreasing" && <TrendingDown className="h-3 w-3 text-red-400" />}
              {f.trend === "stable" && <Minus className="h-3 w-3 text-zinc-500" />}
            </div>
            <p className="mt-0.5 text-[10px] text-zinc-500">{f.domain} · {f.horizon}</p>
            <div className="mt-1 flex items-center gap-1 text-[10px]">
              <span className="text-zinc-400">{f.confidence.replace("-", " ")} confidence</span>
            </div>
          </button>
        ))}
      </div>

      <div className="col-span-2">
        {activeForecast ? (
          <ForecastChart forecast={activeForecast} />
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40 py-12">
            <p className="text-sm text-zinc-500">Select a forecast to view</p>
          </div>
        )}
      </div>
    </div>
  );
});
