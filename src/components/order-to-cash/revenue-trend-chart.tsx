"use client";

import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";

interface RevenueTrend {
  period: string;
  currentRevenue: number;
  previousRevenue: number;
  change: number;
  changePercent: number;
}

interface RevenueTrendChartProps {
  data: RevenueTrend[];
  max?: number;
}

export function RevenueTrendChart({ data, max = 12 }: RevenueTrendChartProps) {
  const displayed = data.slice(0, max);
  const maxRevenue = Math.max(...displayed.map((d) => Math.max(d.currentRevenue, d.previousRevenue)), 1);
  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <div className="mb-3 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-200">Revenue Trends</h3>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-4 rounded-lg border border-gray-800 p-2 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-500" />Current</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-gray-600" />Previous</span>
        </div>
        {displayed.map((d) => {
          const currentWidth = (d.currentRevenue / maxRevenue) * 100;
          const previousWidth = (d.previousRevenue / maxRevenue) * 100;
          return (
            <div key={d.period} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{d.period}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-200">${(d.currentRevenue / 1e6).toFixed(1)}M</span>
                  <span className={`flex items-center gap-0.5 text-[10px] ${d.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {d.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {d.changePercent >= 0 ? "+" : ""}{d.changePercent.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="relative h-5">
                <div className="absolute bottom-0 left-0 h-2 rounded bg-gray-700" style={{ width: `${previousWidth}%` }} />
                <div className="absolute bottom-2 left-0 h-2 rounded bg-emerald-500/80" style={{ width: `${currentWidth}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
