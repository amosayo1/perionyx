"use client";

import { TrendingUp, TrendingDown, BarChart3, Layers, DollarSign, ShoppingCart, PiggyBank, Target } from "lucide-react";
import type { SpendAnalytic } from "./procurement-types";

interface SpendAnalyticsDashboardProps {
  analytics: SpendAnalytic[];
}

const dimIcons: Record<string, React.ReactNode> = {
  department: <Layers className="h-4 w-4" />,
  category: <BarChart3 className="h-4 w-4" />,
  vendor: <ShoppingCart className="h-4 w-4" />,
  project: <Target className="h-4 w-4" />,
  "cost-center": <DollarSign className="h-4 w-4" />,
};

export function SpendAnalyticsDashboard({ analytics }: SpendAnalyticsDashboardProps) {
  const grouped = analytics.reduce<Record<string, SpendAnalytic[]>>((acc, a) => {
    if (!acc[a.dimension]) acc[a.dimension] = [];
    acc[a.dimension].push(a);
    return acc;
  }, {});

  if (analytics.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-[#1a1a1a] p-8">
        <p className="text-sm text-gray-500">No spend analytics available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([dimension, items]) => (
        <div key={dimension} className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="text-gray-500">{dimIcons[dimension] || <BarChart3 className="h-4 w-4" />}</div>
            <h3 className="text-sm font-medium capitalize text-gray-200">{dimension.replace("-", " ")} Analytics</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-gray-500">
                  <th className="px-3 py-2 font-medium">{dimension === "vendor" ? "Vendor" : "Dimension"}</th>
                  <th className="px-3 py-2 font-medium">Period</th>
                  <th className="px-3 py-2 font-medium text-right">Total Spend</th>
                  <th className="px-3 py-2 font-medium text-right">Orders</th>
                  <th className="px-3 py-2 font-medium text-right">Savings</th>
                  <th className="px-3 py-2 font-medium text-right">Budget %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {items.map((item) => {
                  const budgetColor = item.budgetPercent > 100 ? "text-red-400" : item.budgetPercent > 80 ? "text-amber-400" : "text-emerald-400";
                  const budgetBarColor = item.budgetPercent > 100 ? "bg-red-500" : item.budgetPercent > 80 ? "bg-amber-500" : "bg-emerald-500";
                  return (
                    <tr key={item.id} className="hover:bg-gray-800/50">
                      <td className="px-3 py-2 text-xs text-gray-200">{item.dimensionValue}</td>
                      <td className="px-3 py-2 text-xs text-gray-400">{item.period}</td>
                      <td className="px-3 py-2 text-right font-mono text-xs text-gray-200">${(item.totalSpend / 1000).toFixed(0)}k</td>
                      <td className="px-3 py-2 text-right text-xs text-gray-400">{item.totalOrders}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.savingsAmount > 0 ? <TrendingUp className="h-3 w-3 text-emerald-400" /> : <TrendingDown className="h-3 w-3 text-red-400" />}
                          <span className="text-xs text-gray-300">${(item.savingsAmount / 1000).toFixed(0)}k</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-12 rounded-full bg-gray-800">
                            <div className={`h-1.5 rounded-full ${budgetBarColor}`} style={{ width: `${Math.min(item.budgetPercent, 100)}%` }} />
                          </div>
                          <span className={`text-xs font-medium ${budgetColor}`}>{item.budgetPercent}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
