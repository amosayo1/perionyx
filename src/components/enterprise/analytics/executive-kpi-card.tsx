"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, ChevronRight, AlertCircle } from "lucide-react";
import type { KpiData, StatusLevel, TrendDirection } from "./types";

function formatKpiValue(value: string | number): string {
  if (typeof value === "number") {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return value;
}

const STATUS_COLORS: Record<StatusLevel, string> = {
  healthy: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]",
  warning: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]",
  critical: "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.3)]",
  neutral: "bg-zinc-500",
  info: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.3)]",
};

const TREND_ICONS: Record<TrendDirection, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const TREND_COLORS: Record<TrendDirection, string> = {
  up: "text-emerald-400",
  down: "text-red-400",
  neutral: "text-zinc-500",
};

function SparklineSvg({ data, gold }: { data: number[]; gold?: boolean }) {
  if (!data.length || data.every((v) => v === 0)) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = data.length - 1;
  const h = 28;
  const color = gold ? "#d4af37" : "#808080";
  const points = data.map((v, i) => `${i},${h - ((v - min) / range) * (h - 2) - 1}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-full" preserveAspectRatio="none">
      <polygon points={`0,${h} ${points} ${w},${h}`} fill={`url(#kpi-grad-${gold ? "gold" : "grey"})`} opacity={0.08} />
      <polyline fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" points={points} />
      <defs>
        <linearGradient id={`kpi-grad-${gold ? "gold" : "grey"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export const ExecutiveKpiCard = memo(function ExecutiveKpiCard({
  label,
  value,
  trend,
  status,
  confidence,
  subtitle,
  comparisonLabel,
  previousValue,
  variancePercent,
  lastUpdated,
  sparklineData,
  drillDownAction,
  drillDownLabel,
  gold,
  className,
}: KpiData & { className?: string }) {
  const TrendIcon = trend ? TREND_ICONS[trend.direction] : undefined;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border p-5 transition-all duration-200",
        gold
          ? "border-gold/20 bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-black/40"
          : "border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30",
        "hover:border-white/[0.1] hover:bg-white/[0.02]",
        drillDownAction && "cursor-pointer",
        className,
      )}
      onClick={drillDownAction}
      role={drillDownAction ? "button" : undefined}
      tabIndex={drillDownAction ? 0 : undefined}
      onKeyDown={drillDownAction ? (e) => { if (e.key === "Enter" || e.key === " ") drillDownAction(); } : undefined}
    >
      {gold && (
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gold/5 blur-3xl" />
      )}

      {sparklineData && sparklineData.length > 1 && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0">
          <SparklineSvg data={sparklineData} gold={gold} />
        </div>
      )}

      <div className="relative space-y-3">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            {label}
          </span>
          {status && (
            <span className={cn("inline-block h-2 w-2 rounded-full shrink-0", STATUS_COLORS[status])} />
          )}
        </div>

        <div className="flex items-baseline gap-3">
          <span
            className={cn(
              "text-[32px] font-bold leading-[40px] tracking-[-0.02em]",
              gold ? "text-gold" : "text-white",
            )}
          >
            {formatKpiValue(value)}
          </span>
          {trend && TrendIcon && (
            <span className={cn("inline-flex items-center gap-1 text-sm font-medium", TREND_COLORS[trend.direction])}>
              <TrendIcon className="h-4 w-4" />
              <span className="tabular-nums">{trend.value > 0 ? "+" : ""}{trend.value.toFixed(1)}%</span>
            </span>
          )}
        </div>

        {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}

        {previousValue !== undefined && (
          <p className="text-[11px] text-zinc-600">
            Previous: <span className="text-zinc-400">{formatKpiValue(previousValue)}</span>
            {variancePercent !== undefined && (
              <span className={cn("ml-1", variancePercent >= 0 ? "text-emerald-500" : "text-red-400")}>
                ({variancePercent >= 0 ? "+" : ""}{variancePercent.toFixed(1)}%)
              </span>
            )}
          </p>
        )}

        <div className="flex items-center gap-3 pt-0.5 text-[11px] text-zinc-600">
          {comparisonLabel && <span>vs {comparisonLabel}</span>}
          {confidence !== undefined && (
            <span className={cn(
              "flex items-center gap-1",
              confidence >= 95 ? "text-emerald-500" : confidence >= 80 ? "text-amber-500" : "text-red-400",
            )}>
              <AlertCircle className="h-3 w-3" />
              {confidence}% confident
            </span>
          )}
          {lastUpdated && (
            <span>
              {lastUpdated.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
            </span>
          )}
        </div>

        {drillDownAction && drillDownLabel && (
          <div className="pt-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gold opacity-0 group-hover:opacity-100 transition-opacity">
              {drillDownLabel}
              <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
});
