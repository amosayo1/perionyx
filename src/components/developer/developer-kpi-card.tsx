"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { DeveloperKpi } from "./types";

const statusColors: Record<string, string> = {
  healthy: "bg-gold/10 text-gold border-gold/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const trendIcons = { up: TrendingUp, down: TrendingDown, neutral: Minus };
const trendColors: Record<string, string> = { up: "text-gold", down: "text-red-400", neutral: "text-zinc-500" };

export function DeveloperKpiCard({ kpi }: { kpi: DeveloperKpi }) {
  const TrendIcon = trendIcons[kpi.trend];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-all hover:bg-zinc-900/60 hover:border-white/[0.1]"
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-zinc-500 font-medium">{kpi.title}</p>
        <div className={cn("flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium", statusColors[kpi.status])}>
          <span className={cn("h-1.5 w-1.5 rounded-full", kpi.status === "healthy" && "bg-gold", kpi.status === "warning" && "bg-amber-500", kpi.status === "info" && "bg-blue-500")} />
          {kpi.status === "healthy" ? "Healthy" : kpi.status === "warning" ? "Warning" : "Info"}
        </div>
      </div>
      <span className="text-2xl font-semibold tracking-tight text-white">{kpi.value}</span>
      <div className="flex items-center gap-1.5 mt-1">
        <TrendIcon className={cn("h-3 w-3", trendColors[kpi.trend])} />
        <span className={cn("text-[11px] font-medium", trendColors[kpi.trend])}>{kpi.trendLabel}</span>
      </div>
      <p className="mt-2 text-[11px] text-zinc-500 leading-relaxed border-t border-white/[0.04] pt-2">{kpi.insight}</p>
      <div className="flex items-end gap-[2px] h-6 mt-2">
        {kpi.sparklineData.map((point, i) => {
          const max = Math.max(...kpi.sparklineData, 1);
          return (
            <div key={i} className="w-[3px] rounded-full bg-gold/40" style={{ height: Math.max((point / max) * 22, 3) }} />
          );
        })}
      </div>
    </motion.div>
  );
}
