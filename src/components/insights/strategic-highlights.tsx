"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react";
import type { StrategicHighlight } from "./types";

const impactConfig = {
  positive: { icon: TrendingUp, color: "text-gold", bg: "bg-gold/10" },
  negative: { icon: TrendingDown, color: "text-red-400", bg: "bg-red-500/10" },
  neutral: { icon: Minus, color: "text-zinc-400", bg: "bg-zinc-800" },
};

export function StrategicHighlights({ highlights }: { highlights: StrategicHighlight[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-400" />
        <div>
          <h2 className="text-sm font-semibold text-white">Strategic Highlights</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Key insights and trends from this reporting period
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map((hl, i) => {
          const cfg = impactConfig[hl.impact];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={hl.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-all duration-200 hover:bg-zinc-900/60"
            >
              <div className="flex items-start gap-3">
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", cfg.bg)}>
                  <Icon className={cn("h-4 w-4", cfg.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-white">{hl.label}</h3>
                    <span className={cn("text-[10px] font-semibold", cfg.color)}>{hl.change}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500 leading-relaxed">
                    {hl.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
