"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AnimatedCard } from "./motion/animated-card";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: string; direction: "up" | "down" | "neutral" };
  color?: string;
  className?: string;
  onClick?: () => void;
}

const COLOR_MAP: Record<string, { icon: string; border: string; bg: string }> = {
  gold: { icon: "text-gold", border: "border-gold/20", bg: "bg-gold/10" },
  emerald: { icon: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
  amber: { icon: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10" },
  red: { icon: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/10" },
  blue: { icon: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10" },
  purple: { icon: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/10" },
  cyan: { icon: "text-cyan-400", border: "border-cyan-500/20", bg: "bg-cyan-500/10" },
};

function TrendIndicator({ trend }: { trend: NonNullable<MetricCardProps["trend"]> }) {
  const arrow = trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→";
  const color = trend.direction === "up" ? "text-emerald-400" : trend.direction === "down" ? "text-red-400" : "text-zinc-400";
  return <span className={cn("ml-2 text-xs", color)}>{arrow} {trend.value}</span>;
}

export function MetricCard({ label, value, icon, trend, color = "gold", className, onClick }: MetricCardProps) {
  const palette = COLOR_MAP[color] ?? COLOR_MAP.gold;

  return (
    <AnimatedCard
      hoverEffect="elevate"
      onClick={onClick}
      className={cn("p-4", className)}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", palette.border, palette.bg)}>
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-xs text-zinc-500">{label}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-white">{value}</p>
            {trend && <TrendIndicator trend={trend} />}
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
