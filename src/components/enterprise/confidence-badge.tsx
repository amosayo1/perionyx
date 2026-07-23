"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, ShieldQuestion, ShieldX, Shield } from "lucide-react";

type ConfidenceLevel = "very-high" | "high" | "medium" | "low" | "very-low";

interface ConfidenceBadgeProps {
  /** Numeric confidence 0-100. If provided, level is auto-derived. */
  confidence?: number;
  /** Explicit level override. Takes precedence over numeric derivation. */
  level?: ConfidenceLevel;
  /** Display variant: badge (pill), bar (progress), or inline (text only). */
  variant?: "badge" | "bar" | "inline";
  /** Show the numeric percentage alongside the label. */
  showPercent?: boolean;
  /** Optional label override. */
  label?: string;
  className?: string;
}

function deriveLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 95) return "very-high";
  if (confidence >= 80) return "high";
  if (confidence >= 60) return "medium";
  if (confidence >= 40) return "low";
  return "very-low";
}

const LEVEL_CONFIG: Record<ConfidenceLevel, {
  label: string;
  color: string;
  bg: string;
  barColor: string;
  icon: typeof ShieldCheck;
}> = {
  "very-high": {
    label: "Very High",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    barColor: "bg-emerald-500",
    icon: ShieldCheck,
  },
  high: {
    label: "High",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    barColor: "bg-emerald-500",
    icon: ShieldCheck,
  },
  medium: {
    label: "Medium",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    barColor: "bg-amber-500",
    icon: ShieldAlert,
  },
  low: {
    label: "Low",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    barColor: "bg-orange-500",
    icon: ShieldQuestion,
  },
  "very-low": {
    label: "Very Low",
    color: "text-red-400",
    bg: "bg-red-500/10",
    barColor: "bg-red-500",
    icon: ShieldX,
  },
};

export const ConfidenceBadge = memo(function ConfidenceBadge({
  confidence,
  level: explicitLevel,
  variant = "badge",
  showPercent = true,
  label,
  className,
}: ConfidenceBadgeProps) {
  const level = explicitLevel ?? (confidence !== undefined ? deriveLevel(confidence) : "medium");
  const config = LEVEL_CONFIG[level];
  const Icon = config.icon;
  const pct = confidence ?? (level === "very-high" ? 97 : level === "high" ? 85 : level === "medium" ? 65 : level === "low" ? 45 : 20);

  if (variant === "bar") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
          <div
            className={cn("h-full rounded-full transition-all duration-500", config.barColor)}
            style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
          />
        </div>
        <span className={cn("text-[10px] font-semibold tabular-nums", config.color)}>
          {pct}%
        </span>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium", config.color, className)}>
        <Icon className="h-3 w-3" />
        {label ?? config.label}
        {showPercent && confidence !== undefined && <span>({pct}%)</span>}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
        config.bg,
        config.color,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {label ?? config.label}
      {showPercent && confidence !== undefined && <span className="ml-0.5 opacity-70">{pct}%</span>}
    </span>
  );
});
