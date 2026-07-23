"use client";

import { GlassCard } from "@/components/enterprise/glass-panel";
import { StatusBadge } from "@/components/command-center/widget-card";
import { Lightbulb, TrendingUp, Sparkles } from "lucide-react";
import type { Insight, Recommendation } from "@/modules/enterprise-intelligence/types";

interface IntelligenceEnhancedProps {
  insights: Insight[];
  recommendations: Recommendation[];
  className?: string;
}

function severityVariant(s: string): "success" | "warning" | "danger" | "secondary" {
  if (s === "critical") return "danger";
  if (s === "high") return "warning";
  return "secondary";
}

export function IntelligenceCenterEnhanced({ insights, recommendations, className }: IntelligenceEnhancedProps) {
  const hasData = insights.length > 0 || recommendations.length > 0;

  return (
    <GlassCard
      title="Enterprise Intelligence"
      description={`${insights.length} insights · ${recommendations.length} recommendations`}
      variant="default"
      className={className}
      headerClassName="border-b border-white/[0.04] pb-3"
    >
      <div className="space-y-3">
        {!hasData ? (
          <div className="flex items-center justify-center gap-2 py-4">
            <Sparkles className="h-4 w-4 text-zinc-600" />
            <span className="text-xs text-zinc-500">No intelligence data yet.</span>
          </div>
        ) : (
          <>
            {insights.slice(0, 3).map((i) => (
              <div
                key={i.id}
                className="group rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 transition-all hover:bg-white/[0.04] hover:border-white/[0.10]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={severityVariant(i.severity)} label={i.severity} />
                  <span className="text-[10px] text-zinc-500">{i.category}</span>
                  {i.confidence && (
                    <span className="ml-auto text-[9px] text-zinc-600">{i.confidence}% confidence</span>
                  )}
                </div>
                <p className="text-sm font-medium text-white">{i.title}</p>
                <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{i.description}</p>
              </div>
            ))}
            {recommendations.slice(0, 2).map((r) => (
              <div
                key={r.id}
                className="group rounded-xl bg-[#d4af37]/[0.02] border border-[#d4af37]/10 p-3 transition-all hover:bg-[#d4af37]/[0.04] hover:border-[#d4af37]/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="h-3.5 w-3.5 text-[#d4af37]" />
                  <span className="text-[10px] text-[#d4af37]/80 font-medium">Recommendation</span>
                  <StatusBadge status={severityVariant(r.severity)} label={r.severity} />
                </div>
                <p className="text-sm font-medium text-white">{r.title}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.suggestedActions.slice(0, 3).map((a, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/[0.04]">
                      <TrendingUp className="h-3 w-3" />
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </GlassCard>
  );
}
