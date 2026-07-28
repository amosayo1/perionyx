"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ExceptionMetric } from "./types";

const trendIcons = { up: TrendingUp, down: TrendingDown, neutral: Minus };
const trendColors: Record<string, string> = { up: "text-red-400", down: "text-gold", neutral: "text-zinc-500" };
const statusColors: Record<string, string> = {
  critical: "border-l-red-500/40",
  warning: "border-l-amber-500/40",
  healthy: "border-l-gold/40",
};

export function ExceptionCard({ metric }: { metric: ExceptionMetric }) {
  const TrendIcon = trendIcons[metric.trend];

  return (
    <div className={cn("rounded-xl border border-white/[0.06] border-l-2 bg-zinc-900/40 p-3 transition-all hover:bg-zinc-900/60", statusColors[metric.status])}>
      <div className="flex items-start justify-between mb-1">
        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">{metric.label}</span>
        <div className="flex items-center gap-1">
          <TrendIcon className={cn("h-3 w-3", trendColors[metric.trend])} />
          <span className={cn("text-[10px]", trendColors[metric.trend])}>{metric.trendLabel}</span>
        </div>
      </div>
      <p className="text-lg font-semibold text-white">{metric.count}</p>
      <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">{metric.impact}</p>
    </div>
  );
}
