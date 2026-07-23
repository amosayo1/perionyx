"use client";

import { memo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { InsightItem } from "./types";
import { TrendingUp, TrendingDown, AlertTriangle, Info, Lightbulb, ArrowRight, ExternalLink } from "lucide-react";
import { ConfidenceBadge } from "@/components/enterprise/confidence-badge";

interface InsightPanelProps {
  title?: string;
  items: InsightItem[];
  className?: string;
  maxItems?: number;
}

const INSIGHT_STYLES: Record<string, { icon: typeof TrendingUp; border: string; bg: string; iconColor: string }> = {
  positive: {
    icon: TrendingUp,
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/5",
    iconColor: "text-emerald-400",
  },
  negative: {
    icon: TrendingDown,
    border: "border-red-500/20",
    bg: "bg-red-500/5",
    iconColor: "text-red-400",
  },
  info: {
    icon: Info,
    border: "border-blue-500/20",
    bg: "bg-blue-500/5",
    iconColor: "text-blue-400",
  },
  risk: {
    icon: AlertTriangle,
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
    iconColor: "text-amber-400",
  },
};

export const InsightPanel = memo(function InsightPanel({
  title = "Insights",
  items,
  className,
  maxItems = 5,
}: InsightPanelProps) {
  if (!items.length) {
    return (
      <div className={cn("rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30 p-6", className)}>
        <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
        <p className="text-xs text-zinc-600">No insights available for this period.</p>
      </div>
    );
  }

  const displayItems = items.slice(0, maxItems);
  const remaining = items.length - maxItems;

  return (
    <div className={cn("rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30 p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="text-[11px] text-zinc-500">{items.length} insights</span>
      </div>

      <div className="space-y-2">
        {displayItems.map((item, i) => {
          const style = INSIGHT_STYLES[item.type] || INSIGHT_STYLES.info;
          const Icon = style.icon;

          return (
            <div key={i} className={cn("rounded-lg border p-3 transition-colors hover:bg-white/[0.02]", style.border, style.bg)}>
              <div className="flex items-start gap-3">
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.iconColor)} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-200">{item.title}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">{item.description}</p>
                  {item.metric && item.value && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-600">{item.metric}</span>
                      <span className="text-xs font-medium text-zinc-300">{item.value}</span>
                    </div>
                  )}
                  {item.actionLabel && (
                    <button className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-[#c9a84c] hover:text-[#dbb95c] transition-colors">
                      {item.actionLabel}
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                  {(item.sourceUrl || item.confidence !== undefined) && (
                    <div className="mt-1.5 flex items-center gap-2">
                      {item.confidence !== undefined && (
                        <ConfidenceBadge confidence={item.confidence} variant="inline" />
                      )}
                      {item.sourceUrl && (
                        <Link
                          href={item.sourceUrl}
                          className="inline-flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                          {item.sourceLabel ?? "View source"}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {remaining > 0 && (
        <button className="mt-3 w-full rounded-lg border border-white/[0.06] py-2 text-center text-[11px] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] transition-colors">
          +{remaining} more insights
        </button>
      )}
    </div>
  );
});
