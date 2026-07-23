"use client";

import { cn } from "@/lib/utils";

interface MetricDeltaProps {
  value: number;
  suffix?: string;
  size?: "sm" | "md";
  className?: string;
}

export function MetricDelta({ value, suffix = "%", size = "sm", className }: MetricDeltaProps) {
  const positive = value > 0;
  const negative = value < 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-semibold",
        size === "sm" ? "text-[11px]" : "text-[13px]",
        positive && "text-emerald-400",
        negative && "text-red-400",
        !positive && !negative && "text-zinc-400",
        className,
      )}
    >
      {positive ? "▲" : negative ? "▼" : "→"} {Math.abs(value).toFixed(1)}{suffix}
    </span>
  );
}

interface TrendArrowProps {
  direction: "up" | "down" | "flat";
  size?: "sm" | "md";
  className?: string;
}

export function TrendArrow({ direction, size = "sm", className }: TrendArrowProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold",
        size === "sm" ? "text-[11px]" : "text-[13px]",
        direction === "up" && "text-emerald-400",
        direction === "down" && "text-red-400",
        direction === "flat" && "text-zinc-400",
        className,
      )}
      aria-label={`Trend ${direction}`}
    >
      {direction === "up" ? "▲" : direction === "down" ? "▼" : "→"}
    </span>
  );
}

interface ConfidenceScoreProps {
  score: number;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export function ConfidenceScore({ score, size = "sm", showLabel = true, className }: ConfidenceScoreProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        size === "sm" ? "text-[10px]" : "text-[12px]",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          score >= 90 ? "bg-emerald-500" : score >= 70 ? "bg-amber-500" : "bg-zinc-500",
        )}
      />
      {showLabel && (
        <span className="text-zinc-500">
          {score}% confidence
        </span>
      )}
    </span>
  );
}

export function formatCurrency(value: number, compact = true): string {
  if (!Number.isFinite(value)) return "$0";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (compact) {
    if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  }
  return `${sign}$${abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercent(value: number): string {
  return `${(value >= 0 ? "+" : "")}${value.toFixed(1)}%`;
}

export function formatCompactInteger(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

interface HealthIndicatorProps {
  status: "healthy" | "warning" | "critical" | "unknown";
  label?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function HealthDot({ status, label, size = "md", showLabel = true, className }: HealthIndicatorProps) {
  const config = {
    healthy: { dot: "bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]", text: "text-emerald-400", label: "Healthy" },
    warning: { dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]", text: "text-amber-400", label: "Warning" },
    critical: { dot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]", text: "text-red-400", label: "Critical" },
    unknown: { dot: "bg-zinc-500", text: "text-zinc-400", label: "Unknown" },
  };
  const c = config[status];
  const dotSizes = { sm: "h-1.5 w-1.5", md: "h-2 w-2", lg: "h-2.5 w-2.5" };
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("inline-block shrink-0 rounded-full", dotSizes[size], c.dot)} />
      {showLabel && <span className={cn("text-[11px] font-medium", c.text)}>{label ?? c.label}</span>}
    </span>
  );
}
