"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface HealthScoreChartProps {
  score: number;
  label?: string;
  size?: number;
  className?: string;
}

const HEALTH_COLORS: Record<string, string> = {
  good: "text-emerald-400",
  warning: "text-amber-400",
  critical: "text-red-400",
};

const HEALTH_STROKES: Record<string, string> = {
  good: "#34d399",
  warning: "#fbbf24",
  critical: "#f87171",
};

export const HealthScoreChart = memo(function HealthScoreChart({
  score, label, size = 180, className,
}: HealthScoreChartProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (clamped / 100) * circ;

  const health = clamped >= 75 ? "good" : clamped >= 50 ? "warning" : "critical";
  const stroke = HEALTH_STROKES[health];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="rgb(39,39,42)"
          strokeWidth={10}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text
          x={size / 2} y={size / 2 - 4}
          textAnchor="middle"
          fill="white"
          fontSize={32}
          fontWeight="bold"
        >
          {clamped}
        </text>
        <text
          x={size / 2} y={size / 2 + 18}
          textAnchor="middle"
          fill="rgb(113,113,122)"
          fontSize={11}
        >
          / 100
        </text>
      </svg>
      <p className={cn("mt-1 text-xs font-medium uppercase tracking-wider", HEALTH_COLORS[health])}>
        {label || health}
      </p>
    </div>
  );
});
