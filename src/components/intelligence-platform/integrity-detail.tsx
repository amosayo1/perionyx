"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FileText, ExternalLink, AlertCircle } from "lucide-react";
import type { FinancialScoreData } from "@/modules/intelligence-platform/types";

interface IntegrityDetailProps {
  score: FinancialScoreData;
}

const SEVERITY_BAR: Record<string, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  normal: "bg-blue-500",
  good: "bg-emerald-500",
};

const SEVERITY_TEXT: Record<string, string> = {
  critical: "text-red-400",
  warning: "text-amber-400",
  normal: "text-blue-400",
  good: "text-emerald-400",
};

export function IntegrityDetail({ score }: IntegrityDetailProps) {
  const components = score.components ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-500/30 bg-amber-500/10">
          <span className="text-2xl font-bold text-amber-400">{Math.round(score.score)}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Data Integrity</h3>
          <p className="text-xs text-zinc-500">{score.summary ?? "No summary available"}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Component Breakdown</h4>
        {components.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-white truncate">{c.label}</span>
                <span className={cn("text-xs font-medium", SEVERITY_TEXT[c.severity])}>
                  {c.value.toFixed(0)}/{c.maxScore.toFixed(0)}
                </span>
              </div>
              <span className="shrink-0 text-[10px] text-zinc-600">{c.weight}% weight</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-800">
              <motion.div
                className={cn("h-full rounded-full", SEVERITY_BAR[c.severity])}
                initial={{ width: 0 }}
                animate={{ width: `${(c.value / c.maxScore) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
              />
            </div>
            {c.evidence && (
              <div className="mt-2 flex items-center gap-1 text-[11px] text-zinc-500">
                <FileText className="h-3 w-3" />
                <span className="truncate">{c.evidence}</span>
                <ExternalLink className="h-3 w-3 shrink-0 text-zinc-600" />
              </div>
            )}
            {c.affectedModules && c.affectedModules.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {c.affectedModules.map((m, j) => (
                  <span key={j} className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">{m}</span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {score.metadata?.actions != null && Array.isArray(score.metadata.actions) && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Suggested Actions</h4>
          {(score.metadata.actions as string[]).map((action, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-zinc-400">
              <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
              <span>{action}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
