"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertCircle, Zap, Shield, CheckCircle, X, Eye, EyeOff } from "lucide-react";
import type { IntelligenceRecommendationData } from "@/modules/intelligence-platform/types";

interface RecommendationCardProps {
  recommendation: IntelligenceRecommendationData;
  onAcknowledge?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string; border: string; icon: typeof AlertCircle }> = {
  critical: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/25", icon: AlertCircle },
  high: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/25", icon: Zap },
  normal: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/25", icon: Shield },
  low: { bg: "bg-zinc-500/15", text: "text-zinc-400", border: "border-zinc-500/25", icon: CheckCircle },
};

const CONFIDENCE_STYLES: Record<string, string> = {
  high: "bg-emerald-500/10 text-emerald-400",
  medium: "bg-amber-500/10 text-amber-400",
  low: "bg-zinc-500/10 text-zinc-400",
};

export function RecommendationCard({ recommendation: r, onAcknowledge, onDismiss }: RecommendationCardProps) {
  const pStyle = PRIORITY_STYLES[r.priority] ?? PRIORITY_STYLES.low;
  const Icon = pStyle.icon;
  const isDismissed = r.status === "dismissed";
  const isAcknowledged = r.status === "acknowledged" || r.status === "implemented";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        "rounded-xl border bg-zinc-900/60 p-4 transition-colors",
        isDismissed ? "border-zinc-800 opacity-50" : "border-white/[0.06]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", pStyle.border, pStyle.bg)}>
            <Icon className={cn("h-4 w-4", pStyle.text)} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className={cn("text-sm font-medium", isDismissed ? "text-zinc-500" : "text-white")}>{r.title}</h4>
              <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-medium capitalize", pStyle.border, pStyle.text)}>
                {r.priority}
              </span>
              <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize", CONFIDENCE_STYLES[r.confidence])}>
                {r.confidence}
              </span>
            </div>
            {r.description && (
              <p className={cn("mt-1 text-xs leading-relaxed", isDismissed ? "text-zinc-600" : "text-zinc-400")}>{r.description}</p>
            )}
            <p className={cn("mt-0.5 text-xs", isDismissed ? "text-zinc-600" : "text-zinc-500")}><span className="font-medium">Why:</span> {r.reason}</p>
            {r.expectedImpact && (
              <p className={cn("mt-0.5 text-xs italic", isDismissed ? "text-zinc-600" : "text-zinc-500")}>
                Impact: {r.expectedImpact}
              </p>
            )}
            {r.affectedModules && r.affectedModules.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {r.affectedModules.map((m, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {!isAcknowledged && !isDismissed && onAcknowledge && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAcknowledge(r.id)}
              className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              <Eye className="h-3 w-3" />
              Acknowledge
            </motion.button>
          )}
          {!isDismissed && onDismiss && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDismiss(r.id)}
              className="flex items-center gap-1 rounded-lg bg-zinc-800 px-2.5 py-1.5 text-[11px] font-medium text-zinc-400 hover:bg-zinc-700 transition-colors"
            >
              <EyeOff className="h-3 w-3" />
              Dismiss
            </motion.button>
          )}
          {(isAcknowledged || isDismissed) && (
            <span className="text-[10px] text-zinc-600 capitalize">{r.status}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
