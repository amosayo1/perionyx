"use client";

import { cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, Lightbulb,
} from "lucide-react";
import { MOCK_INSIGHTS } from "./data";
import type { PaymentInsight } from "./types";

const SEVERITY_STYLES: Record<PaymentInsight["severity"], { border: string; icon: string; bg: string; trend: typeof TrendingUp }> = {
  positive: {
    border: "border-l-emerald-500",
    icon: "text-emerald-400",
    bg: "bg-emerald-500/10",
    trend: TrendingUp,
  },
  warning: {
    border: "border-l-amber-500",
    icon: "text-amber-400",
    bg: "bg-amber-500/10",
    trend: TrendingDown,
  },
  critical: {
    border: "border-l-red-500",
    icon: "text-red-400",
    bg: "bg-red-500/10",
    trend: TrendingDown,
  },
};

interface ExecutivePaymentInsightsProps {
  className?: string;
}

export function ExecutivePaymentInsights({ className }: ExecutivePaymentInsightsProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2", className)} aria-label="Executive payment insights">
      {MOCK_INSIGHTS.map((insight, idx) => {
        const styles = SEVERITY_STYLES[insight.severity];
        const TrendIcon = styles.trend;
        return (
          <div
            key={idx}
            className={cn(
              "rounded-lg border border-white/[0.06] border-l-4 bg-zinc-900/50 p-5 transition-colors hover:bg-zinc-800/40",
              styles.border,
            )}
            role="article"
            aria-label={`Insight: ${insight.label}`}
          >
            <div className="flex items-start justify-between">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", styles.bg)}>
                <Lightbulb className={cn("h-5 w-5", styles.icon)} aria-hidden="true" />
              </div>
              <TrendIcon className={cn("h-5 w-5", styles.icon)} aria-hidden="true" />
            </div>
            <p className="mt-4 text-2xl font-bold text-white">{insight.value}</p>
            <p className="mt-1 text-[13px] font-medium text-zinc-300">{insight.label}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">{insight.description}</p>
            <p className="mt-3 text-[12px] text-zinc-500">{insight.entity}</p>
          </div>
        );
      })}
    </div>
  );
}
