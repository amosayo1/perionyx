"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { TaxChartDataPoint } from "./tax-types";

interface JurisdictionExposureChartProps {
  dataPoints: TaxChartDataPoint[];
  riskLevels?: ("low" | "medium" | "high")[];
  className?: string;
  height?: number;
}

function riskColor(risk: string): string {
  switch (risk) {
    case "high": return "#ef4444";
    case "medium": return "#f59e0b";
    default: return "#10b981";
  }
}

export const JurisdictionExposureChart = memo(function JurisdictionExposureChart({
  dataPoints, riskLevels = [], className, height = 240,
}: JurisdictionExposureChartProps) {
  if (dataPoints.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40", className)} style={{ height }}>
        <p className="text-sm text-zinc-500">No data available</p>
      </div>
    );
  }

  const maxVal = Math.max(...dataPoints.map((d) => d.value), 1);
  const width = 800;
  const barWidth = Math.max(10, (width / dataPoints.length) * 0.65);
  const gap = (width / dataPoints.length) * 0.35;

  function toY(value: number): number {
    return height - 20 - (value / maxVal) * (height - 40);
  }

  function toX(i: number): number {
    return (i * (width / dataPoints.length)) + (width / dataPoints.length - barWidth) / 2;
  }

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Top Jurisdictions — Tax Exposure</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = toY(maxVal * pct);
          return (
            <g key={pct}>
              <line x1="0" y1={y} x2={width} y2={y} stroke="rgb(63 63 70)" strokeWidth="0.5" />
              <text x={width - 4} y={y + 3} textAnchor="end" className="fill-zinc-600" fontSize="9">
                ${(maxVal * pct / 1_000_000).toFixed(1)}M
              </text>
            </g>
          );
        })}

        {dataPoints.map((d, i) => {
          const x = toX(i);
          const y = toY(d.value);
          const barH = Math.max(2, (d.value / maxVal) * (height - 40));
          const risk = riskLevels[i] ?? "low";

          return (
            <g key={i}>
              <rect
                x={x}
                y={height - 20 - barH}
                width={barWidth}
                height={barH}
                fill={riskColor(risk)}
                opacity={risk === "high" ? 0.9 : risk === "medium" ? 0.75 : 0.6}
                rx="2"
              >
                <title>{d.period}: ${(d.value / 1_000_000).toFixed(2)}M ({risk} risk)</title>
              </rect>
              {d.forecast !== undefined && (
                <line
                  x1={x}
                  y1={toY(d.forecast)}
                  x2={x + barWidth}
                  y2={toY(d.forecast)}
                  stroke={riskColor(risk)}
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
              )}
            </g>
          );
        })}

        {dataPoints.slice(0, 10).map((d, i) => (
          <text
            key={`label-${i}`}
            x={toX(i) + barWidth / 2}
            y={height - 4}
            textAnchor="middle"
            className="fill-zinc-600"
            fontSize="8"
          >
            {d.period.length > 6 ? d.period.slice(0, 6) : d.period}
          </text>
        ))}
      </svg>

      <div className="mt-3 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          <span className="text-[11px] text-zinc-400">Low Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
          <span className="text-[11px] text-zinc-400">Medium Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-500" />
          <span className="text-[11px] text-zinc-400">High Risk</span>
        </div>
      </div>
    </div>
  );
});
