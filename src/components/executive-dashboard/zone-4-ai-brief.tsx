"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowRight, Lightbulb, AlertTriangle, TrendingUp, Sparkles } from "lucide-react";
import { DashboardCard } from "./dashboard-card";

interface Zone4Props {
  todaySummary?: string;
  topRisks?: string[];
  topOpportunities?: string[];
  suggestedActions?: string[];
  className?: string;
}

export const Zone4AiBrief = memo(function Zone4AiBrief({
  todaySummary = "All systems operational. Treasury position is healthy with adequate liquidity. No critical alerts detected.",
  topRisks = ["FX volatility above 3% threshold", "One approval pending > 24 hours"],
  topOpportunities = ["Optimize idle cash in USD wallet", "Automate recurring reconciliation"],
  suggestedActions = ["Review pending approval queue", "Check month-end close progress"],
  className,
}: Zone4Props) {
  return (
    <DashboardCard
      title="AI Executive Brief"
      description="Today&apos;s intelligence summary"
      size="third"
      className={className}
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-gradient-to-r from-gold-500/5 to-transparent p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gold">Today&apos;s Summary</span>
          </div>
          <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-300">{todaySummary}</p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] font-semibold text-zinc-400">Top Risks</span>
          </div>
          <ul className="space-y-1">
            {topRisks.map((risk, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-zinc-400">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/60" />
                {risk}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[11px] font-semibold text-zinc-400">Opportunities</span>
          </div>
          <ul className="space-y-1">
            {topOpportunities.map((opp, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-zinc-400">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/60" />
                {opp}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="h-3.5 w-3.5 text-gold" />
            <span className="text-[11px] font-semibold text-zinc-400">Suggested Actions</span>
          </div>
          <ul className="space-y-1">
            {suggestedActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-zinc-400">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/60" />
                {action}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/insights"
          className="flex items-center justify-center gap-1.5 rounded-lg bg-zinc-800/40 py-2 text-[12px] font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        >
          Open AI Briefing
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </DashboardCard>
  );
});
