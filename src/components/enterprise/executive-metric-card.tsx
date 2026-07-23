"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { MetricTrend } from "./metric-trend";
import { StatusChip } from "./status-chip";

interface ExecutiveMetricCardProps {
  label: string;
  value: string | number;
  trend?: { value: number; direction: "up" | "down" | "neutral"; period?: string };
  status?: "success" | "warning" | "error" | "neutral" | "info";
  confidence?: number;
  subtitle?: string;
  comparisonLabel?: string;
  lastUpdated?: Date;
  sparkline?: number[];
  onClick?: () => void;
  className?: string;
  gold?: boolean;
}

function formatValue(value: string | number): string {
  if (typeof value === "number") {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return value.toLocaleString();
  }
  return value;
}

export const ExecutiveMetricCard = memo(function ExecutiveMetricCard({
  label,
  value,
  trend,
  status,
  confidence,
  subtitle,
  comparisonLabel,
  lastUpdated,
  sparkline,
  onClick,
  className,
  gold,
}: ExecutiveMetricCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border p-5 transition-all duration-200",
        gold
          ? "border-gold-500/20 bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-black/40"
          : "border-zinc-800/60 bg-zinc-900/40",
        "hover:border-zinc-700/60 hover:bg-zinc-900/60",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
    >
      {gold && (
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gold-500/5 blur-3xl" />
      )}
      {sparkline && sparkline.length > 1 && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 opacity-[0.04]">
          <svg viewBox={`0 0 ${sparkline.length - 1} 32`} className="h-8 w-full" preserveAspectRatio="none">
            <path
              d={sparkline
                .map((v, i) => `${i === 0 ? "M" : "L"}${i} ${32 - (v / Math.max(...sparkline)) * 28 - 2}`)
                .join(" ")}
              fill="none"
              stroke={gold ? "#c9a84c" : "#808080"}
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}
      <div className="relative space-y-2">
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            {label}
          </p>
          {status && <StatusChip status={status} />}
        </div>
        <div className="flex items-baseline gap-2">
          <span className={cn(
            "text-[32px] font-bold leading-[40px] tracking-[-0.02em]",
            gold ? "text-gold-500" : "text-white",
          )}>
            {formatValue(value)}
          </span>
          {trend && (
            <MetricTrend
              value={trend.value}
              direction={trend.direction}
              period={trend.period}
            />
          )}
        </div>
        {subtitle && (
          <p className="text-[12px] leading-[16px] text-zinc-500">{subtitle}</p>
        )}
        {(comparisonLabel || confidence !== undefined || lastUpdated) && (
          <div className="flex items-center gap-3 pt-0.5 text-[11px] text-zinc-600">
            {comparisonLabel && <span>vs {comparisonLabel}</span>}
            {confidence !== undefined && (
              <span className={cn(
                "flex items-center gap-1",
                confidence >= 95 ? "text-emerald-500" : confidence >= 80 ? "text-amber-500" : "text-red-500",
              )}>
                <span className="h-1 w-1 rounded-full bg-current" />
                {confidence}% confidence
              </span>
            )}
            {lastUpdated && (
              <span>
                {lastUpdated.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
