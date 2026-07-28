"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Landmark } from "lucide-react";
import { MOCK_INSTITUTION_SUMMARIES } from "./data";

function formatCompact(num: number): string {
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

const HEALTH_STYLES: Record<string, { dot: string; text: string; bg: string }> = {
  healthy: { dot: "bg-emerald-500", text: "text-emerald-400", bg: "" },
  watch: { dot: "bg-amber-500", text: "text-amber-400", bg: "bg-amber-500/5" },
  critical: { dot: "bg-red-500", text: "text-red-400", bg: "bg-red-500/5" },
};

function ServiceBadge({ level }: { level: "premium" | "standard" | "basic" }) {
  const colors: Record<string, string> = {
    premium: "bg-gold/10 text-gold border-gold/20",
    standard: "bg-zinc-800 text-zinc-300 border-white/[0.06]",
    basic: "bg-zinc-800/50 text-zinc-500 border-white/[0.04]",
  };
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider border", colors[level])}>
      {level}
    </span>
  );
}

export function InstitutionOverview({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)} role="region" aria-label="Institution overview">
      <div className="flex items-center gap-2">
        <Landmark className="h-4 w-4 text-zinc-400" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-white">Institution Overview</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8">
        {MOCK_INSTITUTION_SUMMARIES.map((inst, i) => {
          const styles = HEALTH_STYLES[inst.health];
          return (
            <motion.div
              key={inst.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4", styles.bg)}
              role="article" aria-label={`Institution: ${inst.name}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[13px] font-semibold text-white truncate max-w-[140px]">{inst.name}</h3>
                <ServiceBadge level={inst.serviceLevel} />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className={cn("h-2 w-2 rounded-full", styles.dot)} aria-hidden="true" />
                <span className={cn("text-[10px] font-medium uppercase tracking-wider", styles.text)}>{inst.health}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500">Balance</span>
                  <span className="text-[11px] font-medium text-white">{formatCompact(inst.totalBalance)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500">Accounts</span>
                  <span className="text-[11px] font-medium text-white">{inst.accountCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500">Score</span>
                  <span className="text-[11px] font-medium text-emerald-400">{inst.relationshipScore}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
