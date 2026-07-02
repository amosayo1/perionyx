"use client";

import { WidgetCard, StatusBadge } from "./widget-card";
import type { Insight, Recommendation } from "@/modules/enterprise-intelligence/types";

export function IntelligenceCenterWidget({
  insights, recommendations,
}: {
  insights: Insight[]; recommendations: Recommendation[];
}) {
  const severityColor = (s: string) => {
    if (s === "critical") return "critical";
    if (s === "high") return "warning";
    return "neutral";
  };

  return (
    <WidgetCard title="Enterprise Intelligence" description={`${insights.length} insights · ${recommendations.length} recommendations`}>
      <div className="space-y-3">
        {insights.length === 0 && recommendations.length === 0 ? (
          <p className="text-sm text-zinc-500">No intelligence data yet.</p>
        ) : (
          <>
            {insights.slice(0, 3).map((i) => (
              <div key={i.id} className="rounded-lg bg-black/20 border border-white/[0.06] p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={severityColor(i.severity)} label={i.severity} />
                  <span className="text-xs text-zinc-500">{i.category}</span>
                </div>
                <p className="text-sm font-medium text-white">{i.title}</p>
                <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{i.description}</p>
                {i.confidence && <p className="text-[10px] text-zinc-500 mt-1">Confidence: {i.confidence}%</p>}
              </div>
            ))}
            {recommendations.slice(0, 2).map((r) => (
              <div key={r.id} className="rounded-lg bg-black/20 border border-amber-500/10 p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={severityColor(r.severity)} label={r.severity} />
                  <span className="text-xs text-zinc-500">Recommendation</span>
                </div>
                <p className="text-sm font-medium text-white">{r.title}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {r.suggestedActions.slice(0, 2).map((a, i) => (
                    <span key={i} className="text-[10px] text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">{a}</span>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </WidgetCard>
  );
}
