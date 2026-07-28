"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { EnterpriseInsight } from "./types";

const trendIcons = { up: TrendingUp, down: TrendingDown, neutral: Minus };
const trendColors: Record<string, string> = { up: "text-gold", down: "text-red-400", neutral: "text-zinc-500" };
const categoryColors: Record<string, string> = {
  Approvals: "text-blue-400", Treasury: "text-gold", Risk: "text-amber-400",
  Platform: "text-cyan-400", Operations: "text-orange-400", Compliance: "text-purple-400",
};

export function InsightCard({ insight }: { insight: EnterpriseInsight }) {
  const TrendIcon = trendIcons[insight.trend];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 transition-all hover:bg-zinc-900/60">
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs font-medium text-white">{insight.title}</span>
        <span className={cn("text-[10px] font-semibold shrink-0", categoryColors[insight.category] ?? "text-zinc-500")}>
          {insight.category}
        </span>
      </div>
      <p className="text-[11px] text-zinc-500 leading-relaxed">{insight.description}</p>
      <div className="flex items-center gap-1 mt-2">
        <TrendIcon className={cn("h-3 w-3", trendColors[insight.trend])} />
        <span className={cn("text-[11px] font-medium", trendColors[insight.trend])}>{insight.trendLabel}</span>
      </div>
    </div>
  );
}
