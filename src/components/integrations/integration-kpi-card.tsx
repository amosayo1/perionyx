"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { IntegrationKpi } from "./types";

const statusColors: Record<string, string> = {
  healthy: "bg-gold/10 text-gold border-gold/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  inactive: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const statusLabel: Record<string, string> = {
  healthy: "Healthy",
  warning: "Warning",
  critical: "Critical",
  inactive: "Inactive",
};

export function IntegrationKpiCard({ kpi }: { kpi: IntegrationKpi }) {
  const trendUp = kpi.trend.includes("↑") || kpi.trend.includes("active") || kpi.trend.includes("%") || kpi.trend.includes("Ready");
  const trendDown = kpi.trend.includes("↓") || kpi.trend.includes("failure") || kpi.trend.includes("disconnected") || kpi.trend.includes("0%");
  const TrendIcon = trendUp ? TrendingUp : trendDown ? TrendingDown : Minus;
  const trendColor = trendUp ? "text-gold" : trendDown ? "text-red-400" : "text-zinc-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-all hover:bg-zinc-900/60 hover:border-white/[0.1]"
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-zinc-500 font-medium">{kpi.title}</p>
        <div className={cn("flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium", statusColors[kpi.status] ?? statusColors.inactive)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", kpi.status === "healthy" && "bg-gold", kpi.status === "warning" && "bg-amber-500", kpi.status === "critical" && "bg-red-500", kpi.status === "inactive" && "bg-zinc-500")} />
          {statusLabel[kpi.status] ?? kpi.status}
        </div>
      </div>

      <span className="text-2xl font-semibold tracking-tight text-white">{kpi.value}</span>

      {kpi.trend && (
        <div className="flex items-center gap-1.5 mt-1">
          <TrendIcon className={cn("h-3 w-3", trendColor)} />
          <span className={cn("text-[11px] font-medium", trendColor)}>{kpi.trend}</span>
        </div>
      )}

      {kpi.insight && (
        <p className="mt-2 text-[11px] text-zinc-500 leading-relaxed border-t border-white/[0.04] pt-2">{kpi.insight}</p>
      )}
    </motion.div>
  );
}
