"use client";

import type { AccountingKPI, AccountingForecast } from "./accounting-types";
import { TrendingUp, TrendingDown, Minus, BarChart3, LineChart } from "lucide-react";

interface AccountingAnalyticsProps {
  kpis: AccountingKPI[];
  forecasts: AccountingForecast[];
}

export function AccountingAnalytics({ kpis, forecasts }: AccountingAnalyticsProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-200">Key Performance Indicators</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.id} className="rounded-lg border border-gray-800 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{kpi.name}</p>
                <div className={`flex items-center gap-1 text-[10px] ${kpi.trend === "up" ? "text-emerald-400" : kpi.trend === "down" ? "text-red-400" : "text-gray-400"}`}>
                  {kpi.trend === "up" ? <TrendingUp className="h-3 w-3" /> : kpi.trend === "down" ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                </div>
              </div>
              <p className={`mt-1 text-lg font-semibold ${kpi.status === "critical" ? "text-red-400" : kpi.status === "warning" ? "text-amber-400" : "text-emerald-400"}`}>
                {kpi.unit === "USD" ? `$${(kpi.value / 1e6).toFixed(1)}M` : kpi.unit === "percent" ? `${kpi.value.toFixed(1)}%` : kpi.value.toFixed(2)}
              </p>
              <div className="mt-1 flex items-center justify-between text-[10px]">
                <span className="text-gray-600">Target: {kpi.unit === "USD" ? `$${(kpi.target / 1e6).toFixed(1)}M` : kpi.target}</span>
                <span className="text-gray-600">Prev: {kpi.unit === "USD" ? `$${(kpi.previousValue / 1e6).toFixed(1)}M` : kpi.previousValue.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
        <div className="mb-3 flex items-center gap-2">
          <LineChart className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-200">Forecasts</h3>
        </div>
        <div className="space-y-2">
          {forecasts.map((f) => (
            <div key={f.id} className="flex items-center justify-between rounded border border-gray-800 p-3">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium capitalize text-gray-200">{f.metric.replace(/-/g, " ")}</p>
                  <p className="text-xs text-gray-500">{f.period} horizon • {(f.confidence * 100).toFixed(0)}% confidence</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="text-xs text-gray-500">Current</p>
                  <p className="text-sm text-gray-200">${(f.currentValue / 1e6).toFixed(1)}M</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Forecast</p>
                  <p className="text-sm font-medium text-emerald-400">${(f.forecastValue / 1e6).toFixed(1)}M</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Range</p>
                  <p className="text-xs text-gray-400">${(f.lowerBound / 1e6).toFixed(1)}M – ${(f.upperBound / 1e6).toFixed(1)}M</p>
                </div>
                <span className={`text-xs ${f.trend === "increasing" ? "text-emerald-400" : f.trend === "decreasing" ? "text-red-400" : "text-gray-400"}`}>
                  {f.trend === "increasing" ? "↑" : f.trend === "decreasing" ? "↓" : "→"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
