"use client";

import { memo } from "react";

function toRad(deg: number): number { return (deg * Math.PI) / 180; }

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = toRad(angleDeg - 90);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

interface DataPoint { label: string; value: number; target: number; }

const COLORS = ["#d4af37", "#f59e0b", "#ef4444", "#6ee7b7", "#60a5fa"];

export const ComplianceScoreChart = memo(function ComplianceScoreChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40 py-12">
        <p className="text-sm text-zinc-500">No KPI data available</p>
      </div>
    );
  }

  const cx = 40; const cy = 40; const r = 32; const strokeW = 6;

  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.map((d, i) => {
          const angle = Math.min((d.value / d.target) * 360, 360);
          const color = COLORS[i % COLORS.length];
          const pct = Math.min(Math.round((d.value / d.target) * 100), 100);

          return (
            <div key={d.label} className="flex items-center gap-4">
              <div className="relative h-20 w-20 flex-shrink-0">
                <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
                  <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgb(39 39 42)" strokeWidth={strokeW} />
                  <path d={describeArc(cx, cy, r, 0, angle)} fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">{pct}%</span>
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-zinc-500">{d.label}</p>
                <p className="text-sm text-zinc-300">
                  {d.value.toLocaleString()} / {d.target.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
