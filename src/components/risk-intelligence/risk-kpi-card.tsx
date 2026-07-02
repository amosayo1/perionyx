"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { RiskKpi } from "./types";

const trendIcons = { up: TrendingUp, down: TrendingDown, neutral: Minus };
const trendColors: Record<string, string> = { up: "text-[#d4af37]", down: "text-red-400", neutral: "text-zinc-500" };

const statusConfig: Record<string, { label: string; className: string }> = {
  critical: { label: "Critical", className: "bg-red-500/10 text-red-400 border-red-500/20" },
  warning: { label: "Warning", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  healthy: { label: "Healthy", className: "bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20" },
  info: { label: "Info", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
};

export function RiskKpiCard({ kpi }: { kpi: RiskKpi }) {
  const TrendIcon = trendIcons[kpi.trend];
  const cfg = statusConfig[kpi.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-all hover:bg-zinc-900/60 hover:border-white/[0.1]"
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-zinc-500 font-medium">{kpi.title}</p>
        <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold", cfg.className)}>
          {cfg.label}
        </span>
      </div>
      <span className="text-2xl font-semibold tracking-tight text-white block">{kpi.value}</span>
      <div className="flex items-center gap-1.5 mt-1">
        <TrendIcon className={cn("h-3 w-3", trendColors[kpi.trend])} />
        <span className={cn("text-[11px] font-medium", trendColors[kpi.trend])}>{kpi.trendLabel}</span>
      </div>
      <p className="mt-2 text-[11px] text-zinc-500 leading-relaxed border-t border-white/[0.04] pt-2">{kpi.insight}</p>
      <div className="flex items-end gap-[2px] h-6 mt-2">
        {kpi.sparklineData.map((point, i) => {
          const max = Math.max(...kpi.sparklineData, 1);
          return (
            <div key={i} className="w-[3px] rounded-full bg-[#d4af37]/40" style={{ height: Math.max((point / max) * 22, 3) }} />
          );
        })}
      </div>
    </motion.div>
  );
}
