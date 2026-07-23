"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { TaxChartDataPoint } from "./tax-types";

interface TaxLiabilityChartProps {
  vatData: TaxChartDataPoint[];
  corporateData: TaxChartDataPoint[];
  withholdingData: TaxChartDataPoint[];
  otherData: TaxChartDataPoint[];
  className?: string;
  height?: number;
}

const SEGMENT_COLORS = ["#d4af37", "#3b82f6", "#10b981", "#8b5cf6"];
const SEGMENT_LABELS = ["VAT", "Corporate", "Withholding", "Other"];

export const TaxLiabilityChart = memo(function TaxLiabilityChart({
  vatData, corporateData, withholdingData, otherData,
  className, height = 240,
}: TaxLiabilityChartProps) {
  const maxPoints = Math.max(vatData.length, corporateData.length, withholdingData.length, otherData.length);
  if (maxPoints === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40", className)} style={{ height }}>
        <p className="text-sm text-zinc-500">No data available</p>
      </div>
    );
  }

  const allValues = [...vatData, ...corporateData, ...withholdingData, ...otherData].map((d) => d.value);
  const maxVal = Math.max(...allValues, 1);
  const width = 800;

  function getStack(i: number): [number, number, number, number] {
    return [
      vatData[i]?.value ?? 0,
      corporateData[i]?.value ?? 0,
      withholdingData[i]?.value ?? 0,
      otherData[i]?.value ?? 0,
    ];
  }

  const barWidth = Math.max(10, (width / maxPoints) * 0.6);
  const gap = (width / maxPoints) * 0.4;

  function toY(value: number): number {
    return height - 20 - (value / maxVal) * (height - 40);
  }

  function barX(i: number): number {
    return (i * (width / maxPoints)) + (width / maxPoints - barWidth) / 2;
  }

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Tax Liability Breakdown</h3>
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

        {Array.from({ length: maxPoints }).map((_, i) => {
          const stack = getStack(i);
          let bottom = 0;
          const segments = stack.map((val, si) => {
            const segHeight = Math.max(1, (val / maxVal) * (height - 40));
            const y = height - 20 - bottom - segHeight;
            bottom += segHeight;
            return { val, y, height: segHeight, color: SEGMENT_COLORS[si], label: SEGMENT_LABELS[si] };
          });

          const x = barX(i);
          return (
            <g key={i}>
              {segments.map((seg, si) => (
                <rect
                  key={si}
                  x={x}
                  y={seg.y}
                  width={barWidth}
                  height={seg.height}
                  fill={seg.color}
                  opacity="0.85"
                  rx="1"
                >
                  <title>{seg.label}: ${(seg.val / 1_000_000).toFixed(2)}M</title>
                </rect>
              ))}
            </g>
          );
        })}

        {Array.from({ length: maxPoints }).map((_, i) => (
          <text
            key={`label-${i}`}
            x={barX(i) + barWidth / 2}
            y={height - 4}
            textAnchor="middle"
            className="fill-zinc-600"
            fontSize="8"
          >
            {(vatData[i]?.period ?? corporateData[i]?.period ?? withholdingData[i]?.period ?? otherData[i]?.period ?? "").slice(0, 5)}
          </text>
        ))}
      </svg>

      <div className="mt-3 flex items-center justify-center gap-4">
        {SEGMENT_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: SEGMENT_COLORS[i] }} />
            <span className="text-[11px] text-zinc-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
