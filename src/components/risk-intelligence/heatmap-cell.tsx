"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { HeatmapRow } from "./types";

const levelColors: Record<string, string> = {
  low: "bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/20",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/15 text-red-400 border-red-500/20",
};

const levelBgs: Record<string, string> = {
  low: "bg-[#d4af37]/8",
  medium: "bg-amber-500/8",
  high: "bg-orange-500/10",
  critical: "bg-red-500/12",
};

export function HeatmapCell({
  cell,
  index,
}: {
  cell: { category: string; level: "low" | "medium" | "high" | "critical"; value: number };
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.015, duration: 0.2 }}
      className={cn(
        "flex items-center justify-center rounded-lg border px-2 py-2 text-center transition-all hover:scale-105",
        levelColors[cell.level],
        levelBgs[cell.level],
      )}
    >
      <div>
        <span className="text-xs font-semibold">{cell.value}</span>
        <span className={cn("block text-[9px] font-medium mt-0.5 opacity-80", levelColors[cell.level].split(" ")[1])}>
          {cell.level.charAt(0).toUpperCase() + cell.level.slice(1)}
        </span>
      </div>
    </motion.div>
  );
}
