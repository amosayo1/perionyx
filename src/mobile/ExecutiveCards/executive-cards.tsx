"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";

export interface CardMetric {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export interface ExecutiveCardProps {
  metric: CardMetric;
  accent?: "gold" | "emerald" | "red" | "blue" | "amber" | "purple";
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const accentMap = {
  gold: "border-l-gold bg-gold/[0.03]",
  emerald: "border-l-emerald-500 bg-emerald-500/[0.03]",
  red: "border-l-red-500 bg-red-500/[0.03]",
  blue: "border-l-blue-500 bg-blue-500/[0.03]",
  amber: "border-l-amber-500 bg-amber-500/[0.03]",
  purple: "border-l-purple-500 bg-purple-500/[0.03]",
};

const accentTextMap = {
  gold: "text-gold",
  emerald: "text-emerald-400",
  red: "text-red-400",
  blue: "text-blue-400",
  amber: "text-amber-400",
  purple: "text-purple-400",
};

const trendIcons = {
  up: <TrendingUp className="h-3 w-3 text-emerald-400" />,
  down: <TrendingDown className="h-3 w-3 text-red-400" />,
  neutral: <Minus className="h-3 w-3 text-zinc-500" />,
};

export function ExecutiveCard({ metric, accent = "gold", onClick, icon, className, size = "md" }: ExecutiveCardProps) {
  const valueSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  const padding = size === "lg" ? "p-5" : size === "sm" ? "p-3" : "p-4";

  return (
    <motion.button
      whileTap={onClick ? { scale: 0.97 } : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-1.5 rounded-2xl border border-white/[0.06] border-l-[3px] text-left",
        accentMap[accent],
        padding,
        onClick && "cursor-pointer active:opacity-80",
        "min-h-[44px]",
        className,
      )}
      role={onClick ? "button" : "article"}
      aria-label={`${metric.label}: ${metric.value}`}
    >
      <div className="flex items-center justify-between">
        <span className={cn("text-[10px] font-semibold uppercase tracking-[0.12em]", accentTextMap[accent])}>
          {metric.label}
        </span>
        {icon && <span className="text-zinc-500">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={cn(valueSize, "font-bold tracking-tight text-white")}>{metric.value}</span>
        {metric.trend && (
          <span className="flex items-center gap-0.5 text-[10px] text-zinc-500">
            {trendIcons[metric.trend]}
            {metric.trendValue}
          </span>
        )}
      </div>
      {metric.subtitle && <p className="text-[10px] leading-relaxed text-zinc-600">{metric.subtitle}</p>}
    </motion.button>
  );
}

export function ExecutiveCardGrid({
  children,
  columns = 2,
  className,
}: {
  children: React.ReactNode;
  columns?: 1 | 2;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", columns === 1 ? "grid-cols-1" : "grid-cols-2", className)}>
      {children}
    </div>
  );
}

export function ExecutiveHealthScore({
  score,
  maxScore = 100,
  label,
  trend,
  trendValue,
  onClick,
}: {
  score: number;
  maxScore?: number;
  label: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  onClick?: () => void;
}) {
  const pct = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 80 ? "#10b981" : pct >= 50 ? "#d4af37" : "#ef4444";

  return (
    <motion.button
      whileTap={onClick ? { scale: 0.97 } : undefined}
      onClick={onClick}
      className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4"
      role={onClick ? "button" : "article"}
      aria-label={`${label}: ${score} out of ${maxScore}`}
    >
      <div className="relative flex h-[80px] w-[80px] shrink-0 items-center justify-center">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
          <circle
            cx="40" cy="40" r="36"
            fill="none" stroke={color} strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        </svg>
        <span className={cn("absolute text-lg font-bold", pct >= 80 ? "text-emerald-400" : pct >= 50 ? "text-gold" : "text-red-400")}>
          {score}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
        {trend && (
          <div className="mt-1 flex items-center gap-1">
            {trendIcons[trend]}
            <span className="text-[11px] text-zinc-500">{trendValue}</span>
          </div>
        )}
        <div className="mt-2 flex items-center gap-1 text-[10px] text-zinc-600">
          <span>{pct.toFixed(0)}% of target</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </motion.button>
  );
}
