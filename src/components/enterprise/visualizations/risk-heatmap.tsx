"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface HeatmapCell {
  label: string;
  value: number;
  risk: "low" | "medium" | "high" | "critical";
  tooltip?: string;
}

interface RiskHeatmapProps {
  data: HeatmapCell[][];
  rowLabels?: string[];
  colLabels?: string[];
  className?: string;
}

const RISK_COLORS: Record<string, string> = {
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/20",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/20 text-red-400 border-red-500/20",
};

const RISK_BG: Record<string, string> = {
  low: "bg-emerald-500/10",
  medium: "bg-amber-500/10",
  high: "bg-orange-500/10",
  critical: "bg-red-500/10",
};

export function RiskHeatmap({ data, rowLabels, colLabels, className }: RiskHeatmapProps) {
  const prefersReduced = useReducedMotion();

  if (!data.length || !data[0].length) {
    return <div className="flex items-center justify-center py-8 text-xs text-zinc-600">No risk data</div>;
  }

  return (
    <div className={cn("space-y-1", className)}>
      {colLabels && (
        <div className="flex mb-1" style={{ paddingLeft: rowLabels ? "80px" : undefined }}>
          {colLabels.map((label, i) => (
            <div key={i} className="flex-1 text-[9px] text-zinc-600 text-center truncate px-1">{label}</div>
          ))}
        </div>
      )}
      {data.map((row, ri) => (
        <div key={ri} className="flex items-center gap-1">
          {rowLabels && (
            <span className="w-20 text-[10px] text-zinc-500 truncate shrink-0">{rowLabels[ri]}</span>
          )}
          <div className="flex flex-1 gap-1">
            {row.map((cell, ci) => {
              const el = (
                <div
                  key={ci}
                  className={cn(
                    "flex-1 rounded-md border px-1.5 py-2 text-center transition-all duration-200",
                    RISK_COLORS[cell.risk],
                    "hover:scale-105 hover:shadow-lg",
                  )}
                  title={cell.tooltip ?? `${cell.label}: ${cell.value}`}
                >
                  <span className="text-[10px] font-semibold">{cell.value}</span>
                  <span className="text-[8px] block opacity-70 truncate">{cell.label}</span>
                </div>
              );

              if (prefersReduced) return el;
              return (
                <motion.div
                  key={ci}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (ri * row.length + ci) * 0.03, duration: 0.3 }}
                  className="flex-1"
                >
                  {el}
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3 pt-1">
        {Object.entries(RISK_BG).map(([level, bg]) => (
          <div key={level} className="flex items-center gap-1">
            <span className={cn("h-2 w-2 rounded-sm", bg)} />
            <span className="text-[9px] text-zinc-600 capitalize">{level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface GaugeSection {
  label: string;
  value: number;
  max: number;
  color: string;
}

interface GaugeClusterProps {
  sections: GaugeSection[];
  className?: string;
}

export function GaugeCluster({ sections, className }: GaugeClusterProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {sections.map((s) => {
        const pct = Math.min(s.value / s.max, 1);
        return (
          <div key={s.label}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-zinc-500">{s.label}</span>
              <span className="text-[10px] font-medium text-white">{s.value}/{s.max}</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pct * 100}%`, backgroundColor: s.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
