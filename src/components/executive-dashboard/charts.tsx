"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

/* ─── Sparkline ─────────────────────────────────── */
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  gradient?: boolean;
}

export const SparklineChart = memo(function SparklineChart({
  data,
  width = 120,
  height = 32,
  color = "#d4a800",
  strokeWidth = 1.5,
  gradient = true,
}: SparklineProps) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const px = (i: number) => (i / (data.length - 1)) * width;
  const py = (v: number) => height - ((v - min) / range) * (height - 4) - 2;
  const d = data.map((v, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(v)}`).join(" ");
  const fillId = `spark-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg width={width} height={height} className="shrink-0" aria-hidden="true">
      {gradient && (
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
      )}
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {gradient && <path d={`${d}L${width},${height}L0,${height}Z`} fill={`url(#${fillId})`} />}
    </svg>
  );
});

/* ─── Trend Line ─────────────────────────────────── */
interface TrendLineProps {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
  color?: string;
  showLabels?: boolean;
  showGrid?: boolean;
  minGridlines?: number;
}

export const TrendLineChart = memo(function TrendLineChart({
  data,
  width = 400,
  height = 200,
  color = "#d4a800",
  showLabels = true,
  showGrid = true,
  minGridlines = 4,
}: TrendLineProps) {
  if (data.length < 2) return null;
  const pad = { t: 16, r: 16, b: 32, l: 48 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const px = (i: number) => pad.l + (i / (data.length - 1)) * innerW;
  const py = (v: number) => pad.t + innerH - ((v - min) / range) * innerH;
  const lineD = data.map((d, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(d.value)}`).join(" ");
  const areaD = `${lineD}L${px(data.length - 1)},${pad.t + innerH}L${px(0)},${pad.t + innerH}Z`;
  const fillId = `trend-${Math.random().toString(36).slice(2, 8)}`;

  const yTicks = Array.from({ length: minGridlines }, (_, i) => {
    const v = min + (range * i) / (minGridlines - 1);
    return { v, y: pad.t + innerH - (i / (minGridlines - 1)) * innerH };
  });

  return (
    <svg width={width} height={height} className="w-full h-auto" aria-label="Trend chart">
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {showGrid && yTicks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} y1={t.y} x2={pad.l + innerW} y2={t.y} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
          {showLabels && (
            <text x={pad.l - 8} y={t.y + 3} textAnchor="end" fill="rgb(113,113,122)" fontSize={10}>
              {formatCompact(t.v)}
            </text>
          )}
        </g>
      ))}
      <path d={areaD} fill={`url(#${fillId})`} />
      <path d={lineD} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {showLabels && data.map((d, i) => (
        <text
          key={i}
          x={px(i)}
          y={height - 8}
          textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
          fill="rgb(113,113,122)"
          fontSize={10}
        >
          {d.label.length > 6 ? d.label.slice(0, 6) + "…" : d.label}
        </text>
      ))}
    </svg>
  );
});

/* ─── Bar Chart ──────────────────────────────────── */
interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  width?: number;
  height?: number;
  maxBarWidth?: number;
  showLabels?: boolean;
  stacked?: boolean;
  stackedData?: { label: string; values: { value: number; color: string }[] }[];
}

export const BarChart = memo(function BarChart({
  data,
  width = 400,
  height = 200,
  maxBarWidth = 40,
  showLabels = true,
}: BarChartProps) {
  if (data.length === 0) return null;
  const pad = { t: 16, r: 16, b: 32, l: 48 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barW = Math.min(innerW / data.length * 0.7, maxBarWidth);
  const gap = (innerW - barW * data.length) / (data.length + 1);

  return (
    <svg width={width} height={height} className="w-full h-auto" aria-label="Bar chart">
      {Array.from({ length: 4 }, (_, i) => {
        const y = pad.t + (innerH * i) / 3;
        return (
          <g key={i}>
            <line x1={pad.l} y1={y} x2={pad.l + innerW} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
            <text x={pad.l - 8} y={y + 3} textAnchor="end" fill="rgb(113,113,122)" fontSize={10}>
              {formatCompact(maxVal - (maxVal * i) / 3)}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const x = pad.l + gap + i * (barW + gap);
        const barH = (d.value / maxVal) * innerH;
        const y = pad.t + innerH - barH;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={3}
              fill={d.color ?? "#d4a800"}
              opacity={0.85}
            />
            {showLabels && (
              <text
                x={x + barW / 2}
                y={height - 8}
                textAnchor="middle"
                fill="rgb(113,113,122)"
                fontSize={10}
              >
                {d.label.length > 5 ? d.label.slice(0, 5) + "…" : d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
});

/* ─── Donut Chart ────────────────────────────────── */
interface DonutChartProps {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string;
}

export const DonutChart = memo(function DonutChart({
  segments,
  size = 160,
  thickness = 24,
  showLegend = true,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const r = size / 2;
  const innerR = r - thickness;
  const cx = r;
  const cy = r;
  let offset = 0;

  const arcs = segments.map((seg) => {
    const ratio = seg.value / total;
    const angle = ratio * 360;
    const start = offset;
    const end = offset + angle;
    offset = end;
    return { label: seg.label, value: seg.value, color: seg.color, start, end, ratio };
  });

  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const s = polarToCartesian(cx, cy, r, endAngle);
    const e = polarToCartesian(cx, cy, r, startAngle);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M${s.x},${s.y}A${r},${r} 0 ${large} 0 ${e.x},${e.y}`;
  }

  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} className="shrink-0" aria-label="Donut chart" role="img">
        {arcs.map((seg, i) => (
          <path
            key={i}
            d={describeArc(cx, cy, innerR + thickness / 2, seg.start, seg.end)}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeLinecap="round"
          />
        ))}
        {centerValue && (
          <text x={cx} y={cy - 4} textAnchor="middle" fill="rgb(244,244,245)" fontSize={18} fontWeight={700}>
            {centerValue}
          </text>
        )}
        {centerLabel && (
          <text x={cx} y={cy + 14} textAnchor="middle" fill="rgb(113,113,122)" fontSize={10}>
            {centerLabel}
          </text>
        )}
      </svg>
      {showLegend && (
        <div className="space-y-1.5">
          {segments.map((seg, i) => {
            const pct = total > 0 ? (seg.value / total) * 100 : 0;
            return (
              <div key={i} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-[11px] text-zinc-400">{seg.label}</span>
                <span className="ml-auto text-[11px] font-medium text-zinc-300">{pct.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

/* ─── Health Scorecard ────────────────────────────── */
interface HealthScorecardProps {
  label: string;
  score: number;
  maxScore: number;
  status: "healthy" | "warning" | "critical";
  trend?: "up" | "down" | "flat";
  size?: "sm" | "md" | "lg";
}

const statusColors = {
  healthy: { bar: "#22c55e", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  warning: { bar: "#f59e0b", text: "text-amber-400", bg: "bg-amber-500/10" },
  critical: { bar: "#ef4444", text: "text-red-400", bg: "bg-red-500/10" },
};

export const HealthScorecard = memo(function HealthScorecard({
  label,
  score,
  maxScore,
  status,
  trend,
  size = "md",
}: HealthScorecardProps) {
  const pct = (score / maxScore) * 100;
  const sc = statusColors[status];
  const h = size === "sm" ? 48 : size === "md" ? 64 : 96;
  const sw = size === "sm" ? 4 : size === "md" ? 6 : 8;

  return (
    <div className="flex items-center gap-3">
      <svg width={h} height={h} className="shrink-0" aria-label={`${label}: ${score}/${maxScore}`}>
        <circle cx={h / 2} cy={h / 2} r={(h - sw) / 2} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
        <circle
          cx={h / 2}
          cy={h / 2}
          r={(h - sw) / 2}
          fill="none"
          stroke={sc.bar}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * Math.PI * (h - sw)} ${Math.PI * (h - sw) * (1 - pct / 100)}`}
          transform={`rotate(-90 ${h / 2} ${h / 2})`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        <text x={h / 2} y={h / 2 + 1} textAnchor="middle" fill="rgb(244,244,245)" fontSize={size === "sm" ? 11 : 14} fontWeight={700}>
          {Math.round(pct)}%
        </text>
      </svg>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <div className={cn("h-1.5 w-1.5 rounded-full", sc.bg, "bg-current", sc.text)} />
          <span className="text-[12px] font-medium text-zinc-300">{label}</span>
          {trend && trend !== "flat" && (
            <span className={cn("text-[10px]", trend === "up" ? "text-emerald-400" : "text-red-400")}>
              {trend === "up" ? "↑" : "↓"}
            </span>
          )}
        </div>
        <p className="text-[18px] font-bold text-white">
          {score}
          <span className="text-[12px] font-normal text-zinc-500">/{maxScore}</span>
        </p>
      </div>
    </div>
  );
});

/* ─── Helpers ─────────────────────────────────────── */
function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}
