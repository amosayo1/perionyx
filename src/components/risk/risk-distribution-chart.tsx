"use client";

import type { EnterpriseRisk, RiskCategory } from "./risk-types";

interface RiskDistributionChartProps {
  risks: EnterpriseRisk[];
}

const categoryColors: Record<string, string> = {
  market: "rgb(59, 130, 246)", credit: "rgb(239, 68, 68)", liquidity: "rgb(16, 185, 129)",
  fx: "rgb(251, 191, 36)", "interest-rate": "rgb(139, 92, 246)", operational: "rgb(249, 115, 22)",
  counterparty: "rgb(236, 72, 153)", country: "rgb(34, 211, 238)", concentration: "rgb(168, 85, 247)",
  settlement: "rgb(234, 179, 8)", funding: "rgb(20, 184, 166)", investment: "rgb(99, 102, 241)",
  treasury: "rgb(244, 63, 94)", bank: "rgb(14, 165, 233)",
};

export function RiskDistributionChart({ risks }: RiskDistributionChartProps) {
  const byCategory = risks.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});

  const total = risks.length || 1;
  const sorted = Object.entries(byCategory).sort(([, a], [, b]) => b - a);

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-300">Risk Distribution by Category</h3>
      <div className="space-y-2">
        {sorted.map(([cat, count]) => {
          const pct = (count / total) * 100;
          return (
            <div key={cat} className="flex items-center gap-2">
              <span className="w-20 text-xs capitalize text-gray-400">{cat.replace(/-/g, " ")}</span>
              <div className="flex-1 overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: categoryColors[cat] || "rgb(107, 114, 128)" }}
                />
              </div>
              <span className="w-10 text-right text-xs text-gray-500">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
