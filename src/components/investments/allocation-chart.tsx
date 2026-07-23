"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

interface AllocationSegment {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface AllocationChartProps {
  segments: AllocationSegment[];
  className?: string;
}

export const AllocationChart = memo(function AllocationChart({ segments, className }: AllocationChartProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const cx = 80;
  const cy = 80;
  const r = 60;
  const sorted = [...segments].sort((a, b) => b.value - a.value);

  function describeArc(startAngle: number, endAngle: number): string {
    const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
    const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
    const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
    const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  let currentAngle = -90;
  const arcs = sorted.map((seg) => {
    const angle = (seg.percentage / 100) * 360;
    const arc = describeArc(currentAngle, currentAngle + angle);
    currentAngle += angle;
    return { ...seg, arc };
  });

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <h3 className="mb-3 text-sm font-semibold text-white">Asset Allocation</h3>
      <div className="flex items-center gap-6">
        <svg width="160" height="160" viewBox="0 0 160 160" className="shrink-0">
          {arcs.map((seg, i) => (
            <path key={i} d={seg.arc} fill={seg.color} stroke="#18181b" strokeWidth="1" />
          ))}
          <circle cx={cx} cy={cy} r={28} fill="#18181b" />
          <text x={cx} y={cy - 4} textAnchor="middle" fill="#a1a1aa" fontSize="10" fontWeight="600">
            Total
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="white" fontSize="12" fontWeight="700">
            {formatCurrency(total)}
          </text>
        </svg>
        <div className="flex-1 space-y-2">
          {sorted.map((seg, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: seg.color }} />
                <span className="text-xs text-zinc-400">{seg.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-white">{seg.percentage.toFixed(1)}%</span>
                <span className="text-[11px] text-zinc-600">{formatCurrency(seg.value)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
