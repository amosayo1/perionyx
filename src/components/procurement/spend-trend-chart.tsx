"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { SpendAnalytic } from "./procurement-types";

interface SpendTrendChartProps {
  analytics: SpendAnalytic[];
}

export function SpendTrendChart({ analytics }: SpendTrendChartProps) {
  const sorted = [...analytics].sort((a, b) => a.period.localeCompare(b.period));

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-[#1a1a1a] p-6">
        <p className="text-xs text-gray-500">No trend data available</p>
      </div>
    );
  }

  const maxSpend = Math.max(...sorted.map((a) => a.totalSpend), 1);

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-200">Spend Trend</h3>
      <div className="space-y-2">
        {sorted.map((item, i) => {
          const prev = i > 0 ? sorted[i - 1] : null;
          const change = prev ? ((item.totalSpend - prev.totalSpend) / prev.totalSpend) * 100 : 0;
          const widthPct = (item.totalSpend / maxSpend) * 100;
          return (
            <div key={item.id} className="rounded-lg border border-gray-800 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-200">{item.period}</span>
                  <span className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] text-gray-500">{item.totalOrders} orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-gray-200">${(item.totalSpend / 1000).toFixed(0)}k</span>
                  {prev ? (
                    change > 0 ? <TrendingUp className="h-3 w-3 text-red-400" /> : change < 0 ? <TrendingDown className="h-3 w-3 text-emerald-400" /> : <Minus className="h-3 w-3 text-gray-400" />
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-gray-800">
                  <div className="h-2 rounded-full bg-amber-500" style={{ width: `${widthPct}%` }} />
                </div>
                <span className="text-[10px] text-gray-500">Avg ${(item.avgOrderValue / 1000).toFixed(0)}k</span>
              </div>
              {prev && (
                <div className={`mt-1 text-[10px] ${change > 0 ? "text-red-400" : change < 0 ? "text-emerald-400" : "text-gray-500"}`}>
                  {change > 0 ? "+" : ""}{change.toFixed(1)}% vs previous period
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
