"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { HealthScoreRing } from "./health-score-ring";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import type { FinancialScoreData } from "@/modules/intelligence-platform/types";

interface ScoreCardProps {
  score: FinancialScoreData;
  onClick?: () => void;
  showDetails?: boolean;
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  normal: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  good: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function ScoreBar({ value, max, label, weight, severity }: { value: number; max: number; label: string; weight: number; severity: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const barColor =
    severity === "critical" ? "bg-red-500" : severity === "warning" ? "bg-amber-500" : severity === "normal" ? "bg-blue-500" : "bg-emerald-500";
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-500">{weight}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-800">
        <motion.div
          className={cn("h-full rounded-full", barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

export function ScoreCard({ score, onClick, showDetails }: ScoreCardProps) {
  const change = score.change ?? (score.previousScore !== undefined ? score.score - score.previousScore : undefined);

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.01, y: -1 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "rounded-xl border border-white/[0.06] bg-zinc-900/60 p-4 transition-colors",
        onClick && "cursor-pointer hover:border-white/[0.12]",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <HealthScoreRing score={score.score} label="" size="sm" previousScore={score.previousScore} />
          <div>
            <h3 className="text-sm font-medium text-white capitalize">{score.scoreType.replace(/-/g, " ")}</h3>
            <span className={cn("mt-0.5 inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize", SEVERITY_STYLES[score.severity])}>
              {score.severity}
            </span>
          </div>
        </div>
        {change !== undefined && (
          <div className={cn("flex items-center gap-1 text-xs font-medium", change > 0 ? "text-emerald-400" : change < 0 ? "text-red-400" : "text-zinc-500")}>
            {change > 0 ? <TrendingUp className="h-3 w-3" /> : change < 0 ? <TrendingDown className="h-3 w-3" /> : <Info className="h-3 w-3" />}
            {change !== 0 && <span>{change > 0 ? "+" : ""}{change.toFixed(1)}</span>}
          </div>
        )}
      </div>

      {score.summary && (
        <p className="mt-3 text-xs text-zinc-400">{score.summary}</p>
      )}

      {(showDetails && score.components && score.components.length > 0) && (
        <div className="mt-3 space-y-2 border-t border-white/[0.06] pt-3">
          {score.components.map((c, i) => (
            <ScoreBar key={i} label={c.label} value={c.value} max={c.maxScore} weight={c.weight} severity={c.severity} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
