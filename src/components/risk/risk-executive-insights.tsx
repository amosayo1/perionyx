"use client";

import type { RiskInsight } from "./risk-types";

interface RiskExecutiveInsightsProps {
  insights: RiskInsight[];
}

export function RiskExecutiveInsights({ insights }: RiskExecutiveInsightsProps) {
  const grouped = {
    "early-warning": insights.filter((i) => i.type === "early-warning"),
    trend: insights.filter((i) => i.type === "trend"),
    anomaly: insights.filter((i) => i.type === "anomaly"),
    recommendation: insights.filter((i) => i.type === "recommendation"),
    summary: insights.filter((i) => i.type === "summary"),
  };

  const typeLabels: Record<string, string> = {
    "early-warning": "Early Warnings", trend: "Trends", anomaly: "Anomalies",
    recommendation: "Recommendations", summary: "Summaries",
  };

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([type, items]) => {
        if (items.length === 0) return null;
        return (
          <div key={type} className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
            <h3 className="mb-3 text-sm font-medium text-gray-300">{typeLabels[type] || type}</h3>
            <div className="space-y-2">
              {items.slice(0, 3).map((insight) => (
                <div key={insight.id} className="rounded border border-gray-800 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-200">{insight.title}</p>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] ${
                      insight.severity === "critical" ? "bg-red-900/50 text-red-300" :
                      insight.severity === "high" ? "bg-orange-900/50 text-orange-300" :
                      "bg-gray-700 text-gray-400"
                    }`}>{insight.severity}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
