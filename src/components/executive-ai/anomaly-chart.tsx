"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { AnomalyDetection } from "./ai-types";

interface AnomalyChartProps {
  anomalies: AnomalyDetection[];
  className?: string;
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

export const AnomalyChart = memo(function AnomalyChart({ anomalies, className }: AnomalyChartProps) {
  if (anomalies.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40 py-12", className)}>
        <p className="text-sm text-zinc-500">No anomalies to display</p>
      </div>
    );
  }

  const top = anomalies.slice(0, 5);
  const maxVal = Math.max(
    ...top.map(a => Math.max(Math.abs(a.expectedValue), Math.abs(a.actualValue)))
  );

  const BAR_W = 60;
  const BAR_GAP = 12;
  const H = 200;
  const LABEL_H = 20;
  const PAD = { left: 120, right: 20, top: 20, bottom: 40 };

  const chartW = PAD.left + top.length * (BAR_W + BAR_GAP) + PAD.right;
  const chartH = H + PAD.top + PAD.bottom + LABEL_H;

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <h3 className="mb-3 text-xs font-semibold text-zinc-400">Expected vs Actual — Top Anomalies</h3>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ maxHeight: chartH }}>
        <defs>
          <linearGradient id="expBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.7} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
          </linearGradient>
          <linearGradient id="actBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4af37" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#d4af37" stopOpacity={0.4} />
          </linearGradient>
        </defs>

        <line x1={PAD.left - 10} y1={PAD.top} x2={PAD.left - 10} y2={PAD.top + H} stroke="rgb(39,39,42)" strokeWidth={1} />
        <line x1={PAD.left - 10} y1={PAD.top + H} x2={chartW - PAD.right} y2={PAD.top + H} stroke="rgb(39,39,42)" strokeWidth={1} />

        {[0, 0.25, 0.5, 0.75, 1].map(tick => {
          const y = PAD.top + H - tick * H;
          return (
            <g key={tick}>
              <line x1={PAD.left - 12} y1={y} x2={chartW - PAD.right} y2={y} stroke="rgb(39,39,42)" strokeWidth={1} />
              <text x={PAD.left - 16} y={y + 3} textAnchor="end" fill="rgb(113,113,122)" fontSize={9}>
                {formatCurrency(tick * maxVal)}
              </text>
            </g>
          );
        })}

        {top.map((anomaly, i) => {
          const cx = PAD.left + i * (BAR_W + BAR_GAP);
          const expH = (anomaly.expectedValue / maxVal) * H;
          const actH = (Math.abs(anomaly.actualValue) / maxVal) * H;
          const isNegative = anomaly.actualValue < 0 && anomaly.variancePercent < 0;

          return (
            <g key={anomaly.id}>
              <rect
                x={cx}
                y={PAD.top + H - expH}
                width={BAR_W / 2 - 2}
                height={expH}
                fill="url(#expBar)"
                rx={3}
              />
              <rect
                x={cx + BAR_W / 2 + 2}
                y={PAD.top + H - actH}
                width={BAR_W / 2 - 2}
                height={actH}
                fill="url(#actBar)"
                rx={3}
              />
              <text x={cx + BAR_W / 2} y={PAD.top + H + 14} textAnchor="middle" fill="rgb(161,161,170)" fontSize={8}>
                {anomaly.metric.length > 12 ? anomaly.metric.slice(0, 12) + "…" : anomaly.metric}
              </text>
              <text x={cx + BAR_W / 2} y={PAD.top + H + 26} textAnchor="middle" fill={isNegative ? "rgb(248,113,113)" : "rgb(52,211,153)"} fontSize={9}>
                {anomaly.variancePercent > 0 ? "+" : ""}{anomaly.variancePercent.toFixed(1)}%
              </text>
            </g>
          );
        })}

        <text x={PAD.left} y={PAD.top + H + 38} fill="rgb(82,82,91)" fontSize={8}>
          <tspan fill="rgb(59,130,246)">■</tspan> Expected
        </text>
        <text x={PAD.left + 70} y={PAD.top + H + 38} fill="rgb(82,82,91)" fontSize={8}>
          <tspan fill="#d4af37">■</tspan> Actual
        </text>
      </svg>
    </div>
  );
});
