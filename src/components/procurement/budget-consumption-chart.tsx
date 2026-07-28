"use client";

import { BarChart3 } from "lucide-react";
import type { SpendAnalytic } from "./procurement-types";

interface BudgetConsumptionChartProps {
  analytics: SpendAnalytic[];
}

export function BudgetConsumptionChart({ analytics }: BudgetConsumptionChartProps) {
  if (analytics.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-[#1a1a24] p-6">
        <p className="text-xs text-gray-500">No budget data available</p>
      </div>
    );
  }

  const sorted = [...analytics].sort((a, b) => b.budgetPercent - a.budgetPercent);

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-4">
      <div className="mb-3 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-200">Budget Consumption</h3>
      </div>
      <div className="space-y-2">
        {sorted.map((item) => {
          const barColor = item.budgetPercent > 100 ? "bg-red-500" : item.budgetPercent > 80 ? "bg-amber-500" : item.budgetPercent > 50 ? "bg-blue-500" : "bg-emerald-500";
          const textColor = item.budgetPercent > 100 ? "text-red-400" : item.budgetPercent > 80 ? "text-amber-400" : "text-gray-300";
          return (
            <div key={item.id}>
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate text-xs text-gray-200">{item.dimensionValue}</span>
                  <span className="shrink-0 text-[10px] text-gray-500">{item.period}</span>
                </div>
                <span className={`shrink-0 text-xs font-medium ${textColor}`}>{item.budgetPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-800">
                <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${Math.min(item.budgetPercent, 100)}%` }} />
              </div>
              <div className="mt-0.5 flex justify-between text-[10px] text-gray-500">
                <span>${(item.budgetConsumed / 1000).toFixed(0)}k used</span>
                <span>${(item.budgetRemaining / 1000).toFixed(0)}k remaining</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
