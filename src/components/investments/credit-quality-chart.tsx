"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface CreditSegment {
  rating: string;
  value: number;
  percentage: number;
  color: string;
}

interface CreditQualityChartProps {
  segments: CreditSegment[];
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

export const CreditQualityChart = memo(function CreditQualityChart({ segments, className }: CreditQualityChartProps) {
  const maxPct = Math.max(...segments.map((s) => s.percentage), 1);

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <h3 className="mb-4 text-sm font-semibold text-white">Credit Quality Distribution</h3>
      <div className="space-y-3">
        {segments.map((seg, i) => (
          <div key={i}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: seg.color }} />
                <span className="font-medium text-zinc-300">{seg.rating}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">{seg.percentage.toFixed(1)}%</span>
                <span className="text-zinc-600">{formatCurrency(seg.value)}</span>
              </div>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(seg.percentage / maxPct) * 100}%`, backgroundColor: seg.color }}
              />
            </div>
          </div>
        ))}
      </div>
      {segments.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-zinc-500">No credit data available</p>
        </div>
      )}
    </div>
  );
});
