"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, Calendar, Clock } from "lucide-react";
import type { FinancialScoreData } from "@/modules/intelligence-platform/types";

interface CloseReadinessTimelineProps {
  score: FinancialScoreData;
  blockers?: string[];
  estimatedDate?: string;
}

const DAY_COLORS = [
  "bg-emerald-500",
  "bg-emerald-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-amber-500",
  "bg-amber-500",
  "bg-red-500",
  "bg-red-500",
  "bg-red-500",
  "bg-red-500",
];

export function CloseReadinessTimeline({ score, blockers, estimatedDate }: CloseReadinessTimelineProps) {
  const daysUntilClose = Math.max(0, Math.min(10, Math.round((100 - score.score) / 10)));
  const components = score.components ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-500/30 bg-amber-500/10">
          <span className="text-2xl font-bold text-amber-400">{Math.round(score.score)}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Close Readiness</h3>
          <p className="text-xs text-zinc-500">{score.summary ?? "Period-end close readiness assessment"}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Timeline ({daysUntilClose} days estimated)</span>
          {estimatedDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(estimatedDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {DAY_COLORS.slice(0, daysUntilClose).map((color, i) => (
            <motion.div
              key={i}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 8, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={cn("flex-1 rounded-sm", color)}
            />
          ))}
          {DAY_COLORS.slice(daysUntilClose).map((_, i) => (
            <div key={i + daysUntilClose} className="flex-1 rounded-sm bg-zinc-800" />
          ))}
        </div>
        <p className="text-[10px] text-zinc-600">{daysUntilClose} day{daysUntilClose !== 1 ? "s" : ""} until close, {10 - daysUntilClose} day{daysUntilClose !== 1 ? "s" : ""} buffer</p>
      </div>

      {blockers && blockers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Blockers</h4>
          <div className="flex flex-wrap gap-1.5">
            {blockers.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] text-red-400"
              >
                <X className="h-3 w-3" />
                {b}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Progress by Component</h4>
        {components.map((c, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-32 text-xs text-zinc-400 truncate">{c.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-zinc-800">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  c.value / c.maxScore >= 0.8 ? "bg-emerald-500" : c.value / c.maxScore >= 0.5 ? "bg-amber-500" : "bg-red-500",
                )}
                initial={{ width: 0 }}
                animate={{ width: `${(c.value / c.maxScore) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.05 }}
              />
            </div>
            <span className="w-8 text-right text-[10px] text-zinc-600">{Math.round((c.value / c.maxScore) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
