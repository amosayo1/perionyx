"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { GLChartDataPoint } from "./gl-types";

interface JournalVolumeChartProps {
  data: GLChartDataPoint[];
  className?: string;
  height?: number;
}

export const JournalVolumeChart = memo(function JournalVolumeChart({ data, className, height = 240 }: JournalVolumeChartProps) {
  if (data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40", className)} style={{ height }}>
        <p className="text-sm text-zinc-500">No data available</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const width = 800;
  const barWidth = Math.max(10, (width / data.length) * 0.6);

  function toY(value: number): number {
    return height - 20 - (value / maxVal) * (height - 40);
  }

  function toX(i: number): number {
    return (i * (width / data.length)) + (width / data.length - barWidth) / 2;
  }

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Journal Volume by Period</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = toY(maxVal * pct);
          return (
            <g key={pct}>
              <line x1="0" y1={y} x2={width} y2={y} stroke="rgb(63 63 70)" strokeWidth="0.5" />
              <text x={width - 4} y={y + 3} textAnchor="end" className="fill-zinc-600" fontSize="9">
                {(maxVal * pct).toFixed(0)}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const x = toX(i);
          const y = toY(d.value);
          const barH = Math.max(2, (d.value / maxVal) * (height - 40));
          return (
            <rect key={i} x={x} y={height - 20 - barH} width={barWidth} height={barH} fill="#3b82f6" opacity="0.85" rx="2">
              <title>{d.period}: {d.value} journals</title>
            </rect>
          );
        })}

        {data.map((d, i) => (
          <text key={`label-${i}`} x={toX(i) + barWidth / 2} y={height - 4} textAnchor="middle" className="fill-zinc-600" fontSize="8">
            {d.period.length > 5 ? d.period.slice(0, 5) : d.period}
          </text>
        ))}
      </svg>
    </div>
  );
});
