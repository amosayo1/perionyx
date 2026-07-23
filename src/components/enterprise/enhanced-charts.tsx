"use client";

import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number | string;
  showArea?: boolean;
  className?: string;
}

export function Sparkline({ data, color = "#d4af37", height = 40, width = "100%", showArea = true, className }: SparklineProps) {
  if (!data.length || data.every((v) => v === 0)) {
    return (
      <div className={cn("flex items-center justify-center text-xs text-zinc-600", className)} style={{ height }}>
        No data
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = typeof width === "number" ? width : 240;
  const h = height;
  const padding = 2;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * (w - padding * 2) + padding;
      const y = h - ((v - min) / range) * (h - padding * 2) - padding;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const areaPath = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * (w - padding * 2) + padding;
      const y = h - ((v - min) / range) * (h - padding * 2) - padding;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const firstX = ((0) / (data.length - 1)) * (w - padding * 2) + padding;
  const lastX = ((data.length - 1) / (data.length - 1)) * (w - padding * 2) + padding;

  return (
    <svg width={w} height={h} className={cn("block overflow-visible", className)}>
      {showArea && (
        <polygon
          points={`${firstX},${h} ${areaPath} ${lastX},${h}`}
          fill={`url(#sparkline-grad-${color.replace("#", "")})`}
          opacity={0.15}
        />
      )}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
        style={{ filter: `drop-shadow(0 2px 8px ${color}44)` }}
      />
      <defs>
        <linearGradient id={`sparkline-grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.6} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

interface MiniBarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  maxValue?: number;
  className?: string;
}

export function MiniBarChart({ data, height = 60, maxValue, className }: MiniBarChartProps) {
  if (!data.length) {
    return <div className={cn("flex items-center justify-center text-xs text-zinc-600", className)} style={{ height }}>No data</div>;
  }

  const max = maxValue ?? Math.max(...data.map((d) => d.value));
  const barWidth = Math.max(4, Math.min(24, (height - 16) / data.length));

  return (
    <div className={cn("flex items-end gap-1", className)} style={{ height }}>
      {data.map((d, i) => {
        const pct = max > 0 ? (d.value / max) * 100 : 0;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1" style={{ height: "100%" }}>
            <div
              className="w-full rounded-t-sm transition-all duration-500"
              style={{
                height: `${Math.max(pct, 2)}%`,
                backgroundColor: d.color ?? "#d4af37",
                minHeight: 2,
              }}
            />
            <span className="text-[9px] text-zinc-500 truncate w-full text-center">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

interface MiniDonutProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
  className?: string;
}

export function MiniDonut({ value, max = 100, size = 60, strokeWidth = 5, color = "#d4af37", bgColor = "rgba(255,255,255,0.06)", label, className }: MiniDonutProps) {
  const pct = Math.min(value / max, 1);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bgColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white">{label ?? `${Math.round(pct * 100)}%`}</span>
      </div>
    </div>
  );
}
