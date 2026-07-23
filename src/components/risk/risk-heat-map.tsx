"use client";

import type { EnterpriseRisk, HeatLevel } from "./risk-types";

interface RiskHeatMapProps {
  risks: EnterpriseRisk[];
}

const heatColors: Record<HeatLevel, string> = {
  extreme: "bg-red-600",
  high: "bg-orange-500",
  elevated: "bg-amber-400",
  moderate: "bg-yellow-300",
  low: "bg-emerald-500",
};

const heatTextColors: Record<HeatLevel, string> = {
  extreme: "text-white",
  high: "text-white",
  elevated: "text-black",
  moderate: "text-black",
  low: "text-white",
};

export function RiskHeatMap({ risks }: RiskHeatMapProps) {
  const categories = [...new Set(risks.map((r) => r.category))];
  const heatLevels: HeatLevel[] = ["extreme", "high", "elevated", "moderate", "low"];

  const getCount = (category: string, heat: HeatLevel): number =>
    risks.filter((r) => r.category === category && r.score.heatLevel === heat).length;

  const getMaxCount = (): number => {
    let max = 0;
    for (const cat of categories) {
      for (const heat of heatLevels) {
        max = Math.max(max, getCount(cat, heat));
      }
    }
    return max || 1;
  };

  const maxCount = getMaxCount();

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-300">Risk Heat Map</h3>
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="p-1 text-left text-gray-500" />
            {heatLevels.map((h) => (
              <th key={h} className="p-1 text-center capitalize text-gray-500">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat}>
              <td className="p-1 pr-2 text-left capitalize text-gray-400">{cat.replace(/-/g, " ")}</td>
              {heatLevels.map((heat) => {
                const count = getCount(cat, heat);
                const opacity = count > 0 ? Math.max(0.3, count / maxCount) : 0;
                return (
                  <td key={heat} className="p-1">
                    <div
                      className={`flex items-center justify-center rounded p-2 ${count > 0 ? heatColors[heat] + " " + heatTextColors[heat] : "bg-gray-800"}`}
                      style={{ opacity: count > 0 ? opacity : 0.3 }}
                    >
                      {count || "-"}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}