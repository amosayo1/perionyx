"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { TaxChartDataPoint } from "./tax-types";

interface EffectiveTaxRateChartProps {
  dataPoints: TaxChartDataPoint[];
  className?: string;
  height?: number;
}

export const EffectiveTaxRateChart = memo(function EffectiveTaxRateChart({ dataPoints, className, height = 240 }: EffectiveTaxRateChartProps) {
  if (dataPoints.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40", className)} style={{ height }}>
        <p className="text-sm text-zinc-500">No data available</p>
      </div>
    );
  }

  const values = dataPoints.map((d) => d.value);
  const maxVal = Math.max(...values, ...(dataPoints.map((d) => d.previousValue ?? 0)));
  const minVal = Math.min(...values, ...(dataPoints.map((d) => d.previousValue ?? 0)));
  const range = maxVal - minVal || 1;
  const padding = range * 0.15;
  const chartMin = minVal - padding;
  const chartMax = maxVal + padding;
  const chartRange = chartMax - chartMin;

  const width = 800;
  const barWidth = Math.max(12, (width / dataPoints.length) * 0.55);
  const gap = (width / dataPoints.length) * 0.45;

  function toY(value: number): number {
    return height - ((value - chartMin) / chartRange) * (height - 40) - 20;
  }

  function toX(i: number): number {
    return (i * (width / dataPoints.length)) + (width / dataPoints.length - barWidth) / 2;
  }

  const midY = toY((chartMin + chartMax) / 2);

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Effective Tax Rate</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="etrGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = toY(chartMin + chartRange * pct);
          return (
            <g key={pct}>
              <line x1="0" y1={y} x2={width} y2={y} stroke="rgb(63 63 70)" strokeWidth="0.5" />
              <text x={width - 4} y={y + 3} textAnchor="end" className="fill-zinc-600" fontSize="9">
                {(chartMin + chartRange * pct).toFixed(1)}%
              </text>
            </g>
          );
        })}

        <line x1="0" y1={midY} x2={width} y2={midY} stroke="rgb(82 82 91)" strokeWidth="0.5" strokeDasharray="4 2" />

        {dataPoints.map((d, i) => {
          if (d.previousValue !== undefined) {
            const x = toX(i) + barWidth / 2 - 2;
            const y = toY(d.previousValue);
            return (
              <rect
                key={`prev-${i}`}
                x={x}
                y={Math.min(y, midY)}
                width="4"
                height={Math.abs(y - midY)}
                fill="rgb(82 82 91)"
                opacity="0.4"
                rx="1"
              />
            );
          }
          return null;
        })}

        {dataPoints.map((d, i) => {
          const x = toX(i);
          const y = toY(d.value);
          return (
            <rect
              key={`val-${i}`}
              x={x}
              y={Math.min(y, midY)}
              width={barWidth}
              height={Math.max(1, Math.abs(y - midY))}
              fill="url(#etrGold)"
              rx="2"
            >
              <title>{d.period}: {d.value.toFixed(1)}%</title>
            </rect>
          );
        })}

        {dataPoints.map((d, i) => (
          <text
            key={`label-${i}`}
            x={toX(i) + barWidth / 2}
            y={height - 4}
            textAnchor="middle"
            className="fill-zinc-600"
            fontSize="8"
          >
            {d.period.length > 5 ? d.period.slice(0, 5) : d.period}
          </text>
        ))}
      </svg>
    </div>
  );
});
