"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface PeriodCloseTimelineProps {
  steps: { label: string; status: "completed" | "in-progress" | "pending" }[];
  className?: string;
  height?: number;
}

export const PeriodCloseTimeline = memo(function PeriodCloseTimeline({ steps, className, height = 80 }: PeriodCloseTimelineProps) {
  if (steps.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40", className)} style={{ height }}>
        <p className="text-sm text-zinc-500">No timeline data</p>
      </div>
    );
  }

  const width = 800;
  const stepWidth = width / steps.length;

  const STATUS_COLORS: Record<string, string> = {
    completed: "#10b981",
    "in-progress": "#d4af37",
    pending: "rgb(63 63 70)",
  };

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4", className)}>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Period Close Timeline</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="rgb(63 63 70)" strokeWidth="2" />

        {steps.map((step, i) => {
          const x = stepWidth * i + stepWidth / 2;
          const color = STATUS_COLORS[step.status] ?? "rgb(63 63 70)";
          const radius = step.status === "in-progress" ? 8 : 6;

          return (
            <g key={i}>
              <circle cx={x} cy={height / 2} r={radius} fill={color} stroke="#1a1a24" strokeWidth="2">
                <title>{step.label}: {step.status}</title>
              </circle>
              {step.status === "in-progress" && (
                <circle cx={x} cy={height / 2} r="4" fill="#1a1a24" />
              )}
              <text x={x} y={height / 2 - radius - 6} textAnchor="middle" className="fill-zinc-400" fontSize="9">
                {step.status === "completed" ? "✓" : step.status === "in-progress" ? "◉" : "○"}
              </text>
              <text x={x} y={height / 2 + radius + 14} textAnchor="middle" className="fill-zinc-600" fontSize="8">
                {step.label.length > 12 ? step.label.slice(0, 12) + "…" : step.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] text-zinc-400">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-gold" />
          <span className="text-[11px] text-zinc-400">In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
          <span className="text-[11px] text-zinc-400">Pending</span>
        </div>
      </div>
    </div>
  );
});
