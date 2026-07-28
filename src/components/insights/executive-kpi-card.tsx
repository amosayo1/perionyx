"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { KpiMetric } from "./types";

const colorMap: Record<string, string> = {
  emerald: "bg-gold/10 text-gold border-gold/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  zinc: "bg-zinc-800 text-zinc-400 border-zinc-700",
  default: "",
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const trendColors: Record<string, string> = {
  up: "text-gold",
  down: "text-red-400",
  neutral: "text-zinc-500",
};

export function ExecutiveKpiCard({ metric }: { metric: KpiMetric }) {
  const TrendIcon = trendIcons[metric.trend];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-all duration-200 hover:bg-zinc-900/60 hover:border-white/[0.1]"
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-zinc-500 font-medium">{metric.title}</p>
        <div
          className={cn(
            "flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
            trendColors[metric.trend],
            colorMap[metric.color],
          )}
        >
          <TrendIcon className="h-3 w-3" />
          {metric.trendLabel}
        </div>
      </div>

      <span className="text-3xl font-semibold tracking-tight text-white">
        {metric.value}
      </span>

      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-600">
        <span>Previous: {metric.previousValue}</span>
      </div>

      <p className="mt-2 text-[11px] text-zinc-500 leading-relaxed border-t border-white/[0.04] pt-2">
        {metric.insight}
      </p>
    </motion.div>
  );
}
