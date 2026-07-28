"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react";
import type { Recommendation } from "./types";

const trendIcons = { up: TrendingUp, down: TrendingDown, neutral: Minus };
const impactColors: Record<string, string> = {
  high: "border-l-red-500/40",
  medium: "border-l-amber-500/40",
  low: "border-l-gold/40",
};
const trendColors: Record<string, string> = { up: "text-red-400", down: "text-gold", neutral: "text-zinc-500" };
const categoryColors: Record<string, string> = {
  Process: "text-blue-400", Vendor: "text-purple-400", Policy: "text-gold",
  Geographic: "text-amber-400", Operations: "text-orange-400",
};

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  const TrendIcon = trendIcons[rec.trend];

  return (
    <div className={cn("rounded-xl border border-white/[0.06] border-l-2 bg-zinc-900/40 p-3 transition-all hover:bg-zinc-900/60", impactColors[rec.impact])}>
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-amber-400">
          <Lightbulb className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-medium text-white">{rec.title}</span>
            <span className={cn("text-[10px] font-semibold shrink-0", categoryColors[rec.category] ?? "text-zinc-500")}>
              {rec.category}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">{rec.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={cn("text-[10px] font-semibold uppercase", rec.impact === "high" ? "text-red-400" : rec.impact === "medium" ? "text-amber-400" : "text-gold")}>
              {rec.impact} Impact
            </span>
            <span className="text-zinc-700">·</span>
            <div className="flex items-center gap-1">
              <TrendIcon className={cn("h-3 w-3", trendColors[rec.trend])} />
              <span className={cn("text-[10px]", trendColors[rec.trend])}>
                {rec.trend === "up" ? "Increasing" : rec.trend === "down" ? "Decreasing" : "Stable"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
