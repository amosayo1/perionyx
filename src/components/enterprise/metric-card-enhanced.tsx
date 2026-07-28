"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "./animated-counter";
import { Sparkline } from "./enhanced-charts";

type MetricColor = "gold" | "emerald" | "blue" | "purple" | "amber" | "red" | "cyan" | "rose";

interface MetricCardEnhancedProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  color?: MetricColor;
  icon?: ReactNode;
  trend?: "up" | "down" | "flat" | null;
  trendLabel?: string;
  subtitle?: string;
  sparklineData?: number[];
  formatter?: (value: number) => string;
  onClick?: () => void;
  className?: string;
}

const COLOR_CONFIG: Record<MetricColor, { text: string; bg: string; border: string; glow: string }> = {
  gold: { text: "text-gold", bg: "bg-gold/10", border: "border-gold/20", glow: "shadow-gold/10" },
  emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-emerald-500/10" },
  blue: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "shadow-blue-500/10" },
  purple: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", glow: "shadow-purple-500/10" },
  amber: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-amber-500/10" },
  red: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", glow: "shadow-red-500/10" },
  cyan: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", glow: "shadow-cyan-500/10" },
  rose: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", glow: "shadow-rose-500/10" },
};

const TREND_CONFIG = {
  up: { icon: "▲", text: "text-emerald-400" },
  down: { icon: "▼", text: "text-red-400" },
  flat: { icon: "→", text: "text-zinc-500" },
};

export function MetricCardEnhanced({
  label,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  color = "gold",
  icon,
  trend,
  trendLabel,
  subtitle,
  sparklineData,
  formatter,
  onClick,
  className,
}: MetricCardEnhancedProps) {
  const c = COLOR_CONFIG[color];
  const t = trend ? TREND_CONFIG[trend] : null;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-zinc-900/60 via-zinc-900/30 to-black/40 p-5 transition-all duration-300 hover:border-white/[0.12] hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={cn("absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full opacity-[0.04] blur-3xl", c.bg)} />

      {sparklineData && sparklineData.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 opacity-[0.07] pointer-events-none">
          <Sparkline data={sparklineData} color="#d4af37" height={32} showArea={false} />
        </div>
      )}

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">{label}</p>
            <div className="flex items-baseline gap-1.5">
              <AnimatedCounter
                value={value}
                decimals={decimals}
                prefix={prefix}
                suffix={suffix}
                formatter={formatter}
                className="text-2xl font-bold tracking-tight text-white"
              />
            </div>
            {subtitle && <p className="text-[11px] text-zinc-600">{subtitle}</p>}
            {trend && (
              <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", t?.text)}>
                <span>{t?.icon}</span>
                {trendLabel && <span>{trendLabel}</span>}
              </span>
            )}
          </div>
          {icon && (
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl border backdrop-blur-sm", c.bg, c.border, c.text)}>
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
