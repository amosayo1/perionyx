"use client";

import { Layers } from "lucide-react";
import type { SpendAnalytic } from "./procurement-types";

interface DepartmentSpendChartProps {
  analytics: SpendAnalytic[];
}

export function DepartmentSpendChart({ analytics }: DepartmentSpendChartProps) {
  const deptData = analytics.filter((a) => a.dimension === "department");

  if (deptData.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-[#1a1a1a] p-6">
        <p className="text-xs text-gray-500">No department spend data available</p>
      </div>
    );
  }

  const sorted = [...deptData].sort((a, b) => b.totalSpend - a.totalSpend);

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-200">Department Spend</h3>
      <div className="space-y-3">
        {sorted.map((item) => {
          const budgetColor = item.budgetPercent > 100 ? "text-red-400" : item.budgetPercent > 80 ? "text-amber-400" : "text-emerald-400";
          const barColor = item.budgetPercent > 100 ? "bg-red-500" : item.budgetPercent > 80 ? "bg-amber-500" : "bg-emerald-500";
          return (
            <div key={item.id} className="rounded-lg border border-gray-800 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-200">{item.dimensionValue}</span>
                </div>
                <span className="font-mono text-sm font-semibold text-gray-200">${(item.totalSpend / 1000).toFixed(0)}k</span>
              </div>
              <div className="mb-2 h-2 rounded-full bg-gray-800">
                <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${Math.min(item.budgetPercent, 100)}%` }} />
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-500">Budget: ${(item.budgetConsumed / 1000).toFixed(0)}k / ${((item.budgetConsumed + item.budgetRemaining) / 1000).toFixed(0)}k</span>
                <span className={`font-medium ${budgetColor}`}>{item.budgetPercent}% consumed</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
