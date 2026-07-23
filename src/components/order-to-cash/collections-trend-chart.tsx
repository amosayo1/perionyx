"use client";

import { BarChart3, Target } from "lucide-react";

interface CollectionsTrend {
  period: string;
  collected: number;
  target: number;
  remaining: number;
}

interface CollectionsTrendChartProps {
  data: CollectionsTrend[];
  max?: number;
}

export function CollectionsTrendChart({ data, max = 12 }: CollectionsTrendChartProps) {
  const displayed = data.slice(0, max);
  const maxValue = Math.max(...displayed.map((d) => Math.max(d.collected, d.target)), 1);
  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <div className="mb-3 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-200">Collections Trends</h3>
      </div>
      <div className="mb-2 flex items-center gap-4 rounded-lg border border-gray-800 p-2 text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-500" />Collected</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-gray-600" />Target</span>
      </div>
      <div className="space-y-3">
        {displayed.map((d) => {
          const collectedWidth = (d.collected / maxValue) * 100;
          const targetWidth = (d.target / maxValue) * 100;
          const attainment = d.target > 0 ? (d.collected / d.target) * 100 : 0;
          return (
            <div key={d.period}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-gray-400">{d.period}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-emerald-400">${(d.collected / 1e6).toFixed(1)}M</span>
                  <span className="text-[10px] text-gray-500">Target: ${(d.target / 1e6).toFixed(1)}M</span>
                  <span className={`text-[10px] ${attainment >= 100 ? "text-emerald-400" : attainment >= 80 ? "text-amber-400" : "text-red-400"}`}>
                    {attainment.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="relative h-6">
                <div className="absolute bottom-0 left-0 h-2.5 rounded bg-gray-700" style={{ width: `${targetWidth}%` }} />
                <div className="absolute bottom-3 left-0 h-2.5 rounded bg-emerald-500/80" style={{ width: `${collectedWidth}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
