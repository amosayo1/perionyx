"use client";

import { cn } from "@/lib/utils";

type HealthStatus = "healthy" | "good" | "warning" | "degraded" | "critical" | "unhealthy" | "unknown";

interface HealthIndicatorProps {
  status: HealthStatus | string;
  label?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const STATUS_CONFIG: Record<string, { dot: string; bg: string; label: string }> = {
  healthy: { dot: "bg-emerald-400", bg: "bg-emerald-500/10", label: "Healthy" },
  good: { dot: "bg-emerald-400", bg: "bg-emerald-500/10", label: "Good" },
  warning: { dot: "bg-amber-400", bg: "bg-amber-500/10", label: "Warning" },
  degraded: { dot: "bg-amber-400", bg: "bg-amber-500/10", label: "Degraded" },
  critical: { dot: "bg-red-400", bg: "bg-red-500/10", label: "Critical" },
  unhealthy: { dot: "bg-red-400", bg: "bg-red-500/10", label: "Unhealthy" },
  unknown: { dot: "bg-zinc-500", bg: "bg-zinc-900/40", label: "Unknown" },
};

const SIZE_MAP: Record<string, string> = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
};

export function HealthIndicator({ status, label, showLabel = true, size = "md", className }: HealthIndicatorProps) {
  const config = STATUS_CONFIG[status.toLowerCase()] ?? STATUS_CONFIG.unknown;
  const dotSize = SIZE_MAP[size] ?? SIZE_MAP.md;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn("inline-block shrink-0 rounded-full", dotSize, config.dot)} />
      {showLabel && (
        <span className="text-xs text-zinc-400">{label ?? config.label}</span>
      )}
    </div>
  );
}

interface HealthBarProps {
  score: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function HealthBar({ score, max = 100, label, showValue = true, className }: HealthBarProps) {
  const pct = Math.max(0, Math.min(100, (score / max) * 100));
  const color = pct >= 80 ? "bg-emerald-400" : pct >= 60 ? "bg-gold" : "bg-red-400";

  return (
    <div className={cn("space-y-1", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs text-zinc-500">{label}</span>}
          {showValue && <span className="text-xs font-medium text-white">{score}/{max}</span>}
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
