"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { TrendPeriod } from "./types";

const colorMap: Record<string, string> = {
  emerald: "bg-[#d4af37]",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

export function TrendChartPlaceholder({ period }: { period: TrendPeriod }) {
  const max = Math.max(...period.data.map((d) => d.value), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 transition-all hover:bg-zinc-900/60"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-white">{period.label}</span>
      </div>
      <div className="flex items-end gap-1 h-20 mb-2">
        {period.data.map((point, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={cn("w-full rounded-sm", colorMap[point.color ?? "emerald"] ?? "bg-[#d4af37]")}
              style={{ height: `${Math.max((point.value / max) * 72, 6)}px`, opacity: 0.7 }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-zinc-600">
        {period.data.map((point, i) => (
          <span key={i} className="flex-1 text-center">{point.label}</span>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-zinc-500 leading-relaxed border-t border-white/[0.04] pt-2">{period.insight}</p>
    </motion.div>
  );
}
