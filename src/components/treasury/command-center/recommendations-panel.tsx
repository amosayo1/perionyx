"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Lightbulb, AlertTriangle, ArrowUpRight, Sparkles } from "lucide-react";
import { MOCK_RECOMMENDATIONS } from "./data";

const PRIORITY_CONFIG: Record<string, { border: string; bg: string; text: string; label: string }> = {
  critical: { border: "border-red-500/20", bg: "bg-red-500/5", text: "text-red-400", label: "Critical" },
  high: { border: "border-orange-500/20", bg: "bg-orange-500/5", text: "text-orange-400", label: "High" },
  medium: { border: "border-amber-500/20", bg: "bg-amber-500/5", text: "text-amber-400", label: "Medium" },
  low: { border: "border-blue-500/20", bg: "bg-blue-500/5", text: "text-blue-400", label: "Low" },
};

export function RecommendationsPanel({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)} role="region" aria-label="Recommendations">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-zinc-400" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-white">Recommendations</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {MOCK_RECOMMENDATIONS.map((rec, i) => {
          const config = PRIORITY_CONFIG[rec.priority];
          const Icon = rec.priority === "critical" ? AlertTriangle : ArrowUpRight;
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className={cn("rounded-lg border p-4", config.border, config.bg)}
              role="article" aria-label={`${rec.priority} recommendation: ${rec.title}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn("h-4 w-4", config.text)} aria-hidden="true" />
                <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider border", config.border, config.text)}>
                  {config.label}
                </span>
                <span className="text-[10px] text-zinc-500 ml-auto">{rec.category}</span>
              </div>
              <h3 className="text-[13px] font-semibold text-white">{rec.title}</h3>
              <p className="mt-1 text-[12px] text-zinc-400 leading-relaxed">{rec.description}</p>
              <div className="mt-3 pt-2 border-t border-white/[0.06]">
                <span className="text-[10px] font-medium text-zinc-500">Impact: </span>
                <span className="text-[11px] font-medium text-[#c9a84c]">{rec.impact}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
