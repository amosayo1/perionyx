"use client";

import { cn } from "@/lib/utils";

interface TrendLine {
  label: string;
  data: number[];
  color: string;
  dashed?: boolean;
}

interface TrendChartProps {
  lines: TrendLine[];
  labels?: string[];
  height?: number;
  width?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  className?: string;
}

export function TrendChart({
  lines, labels, height = 80, width = 240,
  showLegend, showGrid = true, className,
}: TrendChartProps) {
  if (!lines.length || lines.every((l) => !l.data.length)) {
    return <div className={cn("flex items-center justify-center text-xs text-zinc-600", className)} style={{ height }}>No data</div>;
  }

  const allValues = lines.flatMap((l) => l.data);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;
  const padding = { top: 4, right: 4, bottom: 4, left: 4 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className={cn("block overflow-visible", className)}>
      {showGrid && [0.25, 0.5, 0.75].map((pct) => (
        <line
          key={pct}
          x1={padding.left} x2={width - padding.right}
          y1={padding.top + chartH * (1 - pct)}
          y2={padding.top + chartH * (1 - pct)}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={1}
          strokeDasharray="2 2"
        />
      ))}

      {lines.map((line) => {
        if (!line.data.length) return null;
        const points = line.data.map((v, i) => {
          const x = padding.left + (i / Math.max(line.data.length - 1, 1)) * chartW;
          const y = padding.top + chartH - ((v - min) / range) * chartH;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(" ");

        return (
          <polyline
            key={line.label}
            fill="none"
            stroke={line.color}
            strokeWidth={line.dashed ? 1.5 : 2}
            strokeDasharray={line.dashed ? "4 3" : undefined}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={points}
            style={{ filter: `drop-shadow(0 1px 4px ${line.color}33)` }}
          />
        );
      })}

      {labels && labels.length > 1 && (
        <text x={width / 2} y={height - 1} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize={8}>
          {labels[labels.length - 1]}
        </text>
      )}
    </svg>
  );
}

interface MiniSparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  className?: string;
}

export function MiniSparkline({ data, color = "#d4af37", height = 24, width = 64, className }: MiniSparklineProps) {
  if (!data.length || data.every((v) => v === 0)) {
    return <div className={cn("inline-flex items-center text-[9px] text-zinc-600", className)} style={{ height }}>—</div>;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * width;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className={cn("block shrink-0", className)}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
        style={{ filter: `drop-shadow(0 1px 3px ${color}44)` }}
      />
    </svg>
  );
}

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

export function ProgressRing({ value, max = 100, size = 40, strokeWidth = 3, color = "#d4af37", className }: ProgressRingProps) {
  const pct = Math.min(value / max, 1);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);

  return (
    <svg width={size} height={size} className={cn("inline-block -rotate-90", className)}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
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
  );
}

interface StatusDotProps {
  status: "healthy" | "warning" | "critical" | "neutral";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const DOT_COLORS: Record<string, string> = {
  healthy: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]",
  warning: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]",
  critical: "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.3)]",
  neutral: "bg-zinc-500",
};

const DOT_SIZES: Record<string, string> = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
};

export function StatusDot({ status, size = "md", className }: StatusDotProps) {
  return (
    <span className={cn("inline-block rounded-full", DOT_COLORS[status], DOT_SIZES[size], className)} />
  );
}
