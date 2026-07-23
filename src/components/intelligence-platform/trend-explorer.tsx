"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendChart } from "./trend-chart";
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import type { IntelligenceTrendData, TrendPeriod } from "@/modules/intelligence-platform/types";

interface TrendExplorerProps {
  trends: IntelligenceTrendData[];
  onSelectTrend: (key: string) => void;
  selectedKey?: string;
}

const PERIODS: Array<{ value: TrendPeriod; label: string }> = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

export function TrendExplorer({ trends, onSelectTrend, selectedKey }: TrendExplorerProps) {
  const [periodFilter, setPeriodFilter] = useState<TrendPeriod | "all">("all");
  const [multiOverlay, setMultiOverlay] = useState(false);

  const filtered = periodFilter === "all"
    ? trends
    : trends.filter((t) => t.period === periodFilter);

  const selected = selectedKey ? trends.find((t) => t.trendKey === selectedKey) : null;

  const relatedTrends = multiOverlay && selectedKey
    ? filtered.filter((t) => t.trendKey !== selectedKey).slice(0, 3)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriodFilter(p.value === periodFilter ? "all" : p.value)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
                periodFilter === p.value
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-zinc-800/60 text-zinc-500 hover:text-zinc-300",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setMultiOverlay(!multiOverlay)}
          className={cn(
            "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
            multiOverlay
              ? "bg-blue-500/15 text-blue-400"
              : "bg-zinc-800/60 text-zinc-500 hover:text-zinc-300",
          )}
        >
          Overlay
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {filtered.slice(0, 12).map((t) => (
          <motion.button
            key={t.trendKey}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectTrend(t.trendKey)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors",
              selectedKey === t.trendKey
                ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                : "border-white/[0.06] bg-zinc-900/40 text-zinc-400 hover:text-white",
            )}
          >
            <div className={cn(
              "h-1.5 w-1.5 rounded-full",
              t.direction === "up" ? "bg-emerald-500" : t.direction === "down" ? "bg-red-500" : "bg-zinc-500",
            )} />
            <span>{t.label}</span>
            {t.changePercent != null && (
              <span className={cn(
                "text-[10px] font-medium",
                t.changePercent > 0 ? "text-emerald-400" : t.changePercent < 0 ? "text-red-400" : "text-zinc-500",
              )}>
                {t.changePercent > 0 ? "+" : ""}{t.changePercent.toFixed(1)}%
              </span>
            )}
          </motion.button>
        ))}
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
        {selected ? (
          <div className="space-y-4">
            <TrendChart key={selected.trendKey} trend={selected} height={240} showForecast />
            {relatedTrends.length > 0 && (
              <div className="space-y-3 border-t border-white/[0.06] pt-4">
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Overlay</p>
                {relatedTrends.map((rt) => (
                  <TrendChart key={rt.trendKey} trend={rt} height={120} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="mb-2 h-8 w-8 text-zinc-700" />
            <p className="text-sm text-zinc-500">Select a trend to explore</p>
            <p className="mt-1 text-xs text-zinc-600">Click on a trend label above to view its chart.</p>
          </div>
        )}
      </div>
    </div>
  );
}
