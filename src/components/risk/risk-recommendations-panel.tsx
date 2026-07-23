"use client";

import type { Recommendation } from "./risk-types";

interface RiskRecommendationsPanelProps {
  recommendations: Recommendation[];
  max?: number;
}

export function RiskRecommendationsPanel({ recommendations, max = 8 }: RiskRecommendationsPanelProps) {
  const open = recommendations.filter((r) => r.status === "open" || r.status === "in-progress").slice(0, max);
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...open].sort((a, b) => (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99));

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Recommendations</h3>
        <span className="text-xs text-gray-500">{open.length} open</span>
      </div>
      {sorted.length === 0 ? (
        <p className="text-sm text-gray-500">No open recommendations</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((rec) => (
            <div key={rec.id} className="rounded border border-gray-800 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-200">{rec.title}</p>
                <span className={`rounded px-1.5 py-0.5 text-[10px] uppercase ${
                  rec.priority === "critical" ? "bg-red-900/50 text-red-300" :
                  rec.priority === "high" ? "bg-orange-900/50 text-orange-300" :
                  rec.priority === "medium" ? "bg-blue-900/50 text-blue-300" :
                  "bg-gray-700 text-gray-400"
                }`}>{rec.priority}</span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">{rec.description}</p>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-600">
                <span>Owner: {rec.owner}</span>
                {rec.estimatedEffort && <span>• {rec.estimatedEffort}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
