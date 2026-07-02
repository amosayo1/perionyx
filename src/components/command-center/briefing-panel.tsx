"use client";

import { WidgetCard } from "./widget-card";
import type { CommandCenterData } from "@/modules/command-center/command-center.service";

export function BriefingPanel({ briefing, decisionBriefing }: {
  briefing: CommandCenterData["briefing"];
  decisionBriefing: CommandCenterData["decisionBriefing"];
}) {
  return (
    <WidgetCard title="Executive Briefing" description="Latest intelligence summary">
      <div className="space-y-3">
        {briefing ? (
          <>
            <p className="text-xs font-medium text-white">{briefing.title}</p>
            <div className="space-y-2">
              {briefing.sections.slice(0, 4).map((s) => (
                <div key={s.title} className="rounded-lg bg-black/20 border border-white/[0.06] p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white">{s.title}</span>
                    <span className={`text-[10px] px-1.5 rounded ${
                      s.confidence === "high" ? "bg-emerald-500/20 text-emerald-400" :
                      s.confidence === "medium" ? "bg-amber-500/20 text-amber-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>{s.confidence}</span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2">{s.summary}</p>
                </div>
              ))}
            </div>
          </>
        ) : <p className="text-xs text-zinc-500">No briefing available.</p>}

        {decisionBriefing && (
          <div className="rounded-lg bg-black/20 border border-amber-500/10 p-2.5">
            <p className="text-xs font-medium text-white mb-1">{decisionBriefing.title}</p>
            <p className="text-xs text-zinc-400">{decisionBriefing.totalDecisions} decisions · {decisionBriefing.criticalCount} critical</p>
            {decisionBriefing.topDecisions.length > 0 && (
              <div className="mt-2 space-y-1">
                {decisionBriefing.topDecisions.map((r, i) => (
                  <p key={i} className="text-[10px] text-zinc-500">{r}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </WidgetCard>
  );
}
