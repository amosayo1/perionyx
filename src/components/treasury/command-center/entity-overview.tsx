"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Building2, TrendingUp, TrendingDown } from "lucide-react";
import { MOCK_ENTITY_SUMMARIES } from "./data";

function formatCompact(num: number): string {
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

const STATUS_STYLES: Record<string, { dot: string; text: string; bg: string }> = {
  healthy: { dot: "bg-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/5 border-emerald-500/10" },
  watch: { dot: "bg-amber-500", text: "text-amber-400", bg: "bg-amber-500/5 border-amber-500/10" },
  critical: { dot: "bg-red-500", text: "text-red-400", bg: "bg-red-500/5 border-red-500/10" },
};

export function EntityOverview({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)} role="region" aria-label="Entity overview">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-zinc-400" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-white">Entity Overview</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {MOCK_ENTITY_SUMMARIES.map((entity, i) => {
          const styles = STATUS_STYLES[entity.status];
          return (
            <motion.div
              key={entity.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4", styles.bg)}
              role="article" aria-label={`Entity: ${entity.name}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[13px] font-semibold text-white">{entity.name}</h3>
                <div className="flex items-center gap-1.5">
                  <span className={cn("h-2 w-2 rounded-full", styles.dot)} aria-hidden="true" />
                  <span className={cn("text-[10px] font-medium uppercase tracking-wider", styles.text)}>{entity.status}</span>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500">{entity.region}</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500">Total Cash</span>
                  <span className="text-[11px] font-medium text-white">{formatCompact(entity.totalCash)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500">Available</span>
                  <span className="text-[11px] font-medium text-white">{formatCompact(entity.availableLiquidity)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500">Payment Volume</span>
                  <span className="text-[11px] font-medium text-white">{formatCompact(entity.paymentVolume)}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
