"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { GLChartDataPoint } from "./gl-types";

interface RevenueTrendChartProps {
  data: GLChartDataPoint[];
  className?: string;
  height?: number;
}

export const RevenueTrendChart = memo(function RevenueTrendChart({ data, className, height = 240 }: RevenueTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40", className)} style={{ height }}>
        <p className="text-sm text-zinc-500">No data available</p>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const forecastValues = data.filter((d) => d.forecast !== undefined).map((d) => d.forecast!);
  const maxVal = Math.max(...values, ...forecastValues, 1);
  const isCurrency = values.some((v) => v > 1000);
  const width = 800;
  const barWidth = Math.max(10, (width / data.length) * 0.55);
  const gap = (width / data.length) * 0.45;

  function toY(value: number): number {
    return height - 20 - (value / maxVal) * (height - 40);
  }

  function toX(i: number): number {
    return (i * (width / data.length)) + (width / data.length - barWidth) / 2;
  }

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Revenue Trend</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = toY(maxVal * pct);
          return (
            <g key={pct}>
              <line x1="0" y1={y} x2={width} y2={y} stroke="rgb(63 63 70)" strokeWidth="0.5" />
              <text x={width - 4} y={y + 3} textAnchor="end" className="fill-zinc-600" fontSize="9">
                {isCurrency ? `$${(maxVal * pct / 1_000_000).toFixed(0)}M` : (maxVal * pct).toFixed(0)}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const x = toX(i);
          const y = toY(d.value);
          const barH = Math.max(2, (d.value / maxVal) * (height - 40));
          return (
            <g key={i}>
              <rect x={x} y={height - 20 - barH} width={barWidth} height={barH} fill="#d4af37" opacity="0.8" rx="2">
                <title>{d.period}: ${(d.value / 1_000_000).toFixed(2)}M</title>
              </rect>
              {d.forecast !== undefined && (
                <rect x={x} y={toY(d.forecast) - 1} width={barWidth} height="2" fill="#d4af37" opacity="0.5" />
              )}
              {d.previousValue !== undefined && (
                <line x1={x} y1={toY(d.previousValue)} x2={x + barWidth} y2={toY(d.previousValue)} stroke="rgb(113 113 122)" strokeWidth="1" strokeDasharray="3 2" />
              )}
            </g>
          );
        })}

        {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 8)) === 0 || i === data.length - 1).map((d, i) => {
          const idx = data.indexOf(d);
          return (
            <text key={`label-${i}`} x={toX(idx) + barWidth / 2} y={height - 4} textAnchor="middle" className="fill-zinc-600" fontSize="8">
              {d.period.length > 6 ? d.period.slice(0, 6) : d.period}
            </text>
          );
        })}
      </svg>

      <div className="mt-3 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#d4af37]" />
          <span className="text-[11px] text-zinc-400">Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t border-dashed border-zinc-500" />
          <span className="text-[11px] text-zinc-400">Previous</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-[#d4af37]/50" />
          <span className="text-[11px] text-zinc-400">Forecast</span>
        </div>
      </div>
    </div>
  );
});
