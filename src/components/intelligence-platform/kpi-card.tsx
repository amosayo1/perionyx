"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { KPIValueData } from "@/modules/intelligence-platform/types";

interface KpiCardProps {
  kpi: KPIValueData;
  onClick?: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  on_track: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  at_risk: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  neutral: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const TREND_COLORS: Record<string, string> = {
  up: "text-emerald-400",
  down: "text-red-400",
  flat: "text-zinc-400",
  volatile: "text-amber-400",
};

function TrendIcon({ direction }: { direction: string }) {
  if (direction === "up") return <TrendingUp className="h-3.5 w-3.5" />;
  if (direction === "down") return <TrendingDown className="h-3.5 w-3.5" />;
  return <Minus className="h-3.5 w-3.5" />;
}

export function KpiCard({ kpi, onClick }: KpiCardProps) {
  const targetPct = kpi.targetValue != null && kpi.targetValue !== 0
    ? Math.min((kpi.currentValue / kpi.targetValue) * 100, 100)
    : null;

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.01, y: -1 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "rounded-xl border border-white/[0.06] bg-zinc-900/60 p-4 transition-colors",
        onClick && "cursor-pointer hover:border-white/[0.12]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-zinc-500">{kpi.label}</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white">
              {kpi.currentValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
            {kpi.unit && <span className="text-xs text-zinc-500">{kpi.unit}</span>}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-medium capitalize", STATUS_STYLES[kpi.status])}>
            {kpi.status.replace(/_/g, " ")}
          </span>
          {kpi.trend && (
            <div className={cn("flex items-center gap-0.5 text-xs", TREND_COLORS[kpi.trend])}>
              <TrendIcon direction={kpi.trend} />
              {kpi.variancePercent != null && (
                <span>{kpi.variancePercent > 0 ? "+" : ""}{kpi.variancePercent.toFixed(1)}%</span>
              )}
            </div>
          )}
        </div>
      </div>

      {kpi.variance != null && (
        <div className="mt-2 flex items-center gap-1 text-xs text-zinc-500">
          <span>Variance: </span>
          <span className={kpi.variance > 0 ? "text-emerald-400" : "text-red-400"}>
            {kpi.variance > 0 ? "+" : ""}{kpi.variance.toFixed(1)}{kpi.unit ?? ""}
          </span>
        </div>
      )}

      {targetPct !== null && (
        <div className="mt-2.5 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-zinc-500">
            <span>vs target</span>
            <span>{targetPct.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800">
            <motion.div
              className={cn(
                "h-full rounded-full",
                kpi.status === "critical" ? "bg-red-500" : kpi.status === "at_risk" ? "bg-amber-500" : "bg-emerald-500",
              )}
              initial={{ width: 0 }}
              animate={{ width: `${targetPct}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      )}

      {kpi.previousValue != null && kpi.currentValue !== kpi.previousValue && (
        <div className="mt-2 text-[10px] text-zinc-600">
          Prev: {kpi.previousValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}{kpi.unit ?? ""}
        </div>
      )}
    </motion.div>
  );
}
