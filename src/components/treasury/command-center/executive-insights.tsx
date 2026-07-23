"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { MOCK_INSIGHTS } from "./data";

const SEVERITY_CONFIG: Record<string, { border: string; bg: string; icon: React.ElementType; text: string }> = {
  positive: { border: "border-emerald-500/20", bg: "bg-emerald-500/5", icon: TrendingUp, text: "text-emerald-400" },
  warning: { border: "border-amber-500/20", bg: "bg-amber-500/5", icon: AlertTriangle, text: "text-amber-400" },
  critical: { border: "border-red-500/20", bg: "bg-red-500/5", icon: TrendingDown, text: "text-red-400" },
};

export function ExecutiveInsights({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)} role="region" aria-label="Executive insights">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-zinc-400" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-white">Executive Insights</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {MOCK_INSIGHTS.map((insight, i) => {
          const config = SEVERITY_CONFIG[insight.severity];
          const Icon = config.icon;
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={cn("rounded-lg border p-4", config.border, config.bg)}
              role="article" aria-label={`Insight: ${insight.label}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn("h-4 w-4", config.text)} aria-hidden="true" />
                <span className={cn("text-[10px] font-medium uppercase tracking-wider", config.text)}>{insight.severity}</span>
              </div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{insight.label}</p>
              <p className={cn("mt-0.5 text-lg font-semibold", config.text)}>{insight.value}</p>
              <p className="mt-1 text-[12px] text-zinc-400 leading-relaxed">{insight.description}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
