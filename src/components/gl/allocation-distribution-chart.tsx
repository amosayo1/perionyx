"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface AllocationDistributionChartProps {
  segments: { label: string; value: number }[];
  className?: string;
  height?: number;
}

const PIE_COLORS = ["#d4af37", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899", "#84cc16", "#14b8a6"];

export const AllocationDistributionChart = memo(function AllocationDistributionChart({ segments, className, height = 240 }: AllocationDistributionChartProps) {
  if (segments.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40", className)} style={{ height }}>
        <p className="text-sm text-zinc-500">No data available</p>
      </div>
    );
  }

  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const width = 800;
  const cx = width * 0.3;
  const cy = height / 2;
  const radius = Math.min(cx - 20, cy - 20, 100);

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
  }

  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  }

  let currentAngle = 0;

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Allocation Distribution</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {segments.map((seg, i) => {
          const angle = (seg.value / total) * 360;
          const path = describeArc(cx, cy, radius, currentAngle, currentAngle + angle);
          const midAngle = currentAngle + angle / 2;
          const labelRadius = radius * 0.65;
          const labelPos = polarToCartesian(cx, cy, labelRadius, midAngle);
          currentAngle += angle;

          return (
            <g key={i}>
              <path d={path} fill={PIE_COLORS[i % PIE_COLORS.length]} opacity="0.85" stroke="#1a1a1a" strokeWidth="1.5">
                <title>{seg.label}: ${(seg.value / 1_000).toFixed(1)}K ({((seg.value / total) * 100).toFixed(1)}%)</title>
              </path>
              {angle > 15 && (
                <text x={labelPos.x} y={labelPos.y} textAnchor="middle" className="fill-white" fontSize="9" fontWeight="bold">
                  {((seg.value / total) * 100).toFixed(0)}%
                </text>
              )}
            </g>
          );
        })}

        <g>
          {segments.map((seg, i) => {
            const x = width * 0.55;
            const y = 20 + i * 22;
            return (
              <g key={`legend-${i}`}>
                <rect x={x} y={y - 6} width="10" height="10" rx="1" fill={PIE_COLORS[i % PIE_COLORS.length]} />
                <text x={x + 16} y={y + 2} className="fill-zinc-400" fontSize="10">{seg.label}</text>
                <text x={width - 20} y={y + 2} textAnchor="end" className="fill-zinc-500" fontSize="10">
                  ${(seg.value / 1_000).toFixed(0)}K
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
});
