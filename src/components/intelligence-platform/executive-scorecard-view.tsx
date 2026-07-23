"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { HealthScoreRing } from "./health-score-ring";
import { KpiCard } from "./kpi-card";
import { RecommendationCard } from "./recommendation-card";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { ScorecardData, FinancialScoreData, KPIValueData, IntelligenceRecommendationData } from "@/modules/intelligence-platform/types";

interface ExecutiveScorecardViewProps {
  scorecard: ScorecardData;
  onRoleChange?: (role: string) => void;
  role: string;
}

const ROLES = ["ceo", "cfo", "controller", "treasurer", "finance-manager", "board", "auditor"];

const SCORE_LABELS: Record<string, string> = {
  integrity: "Data Integrity",
  "close-readiness": "Close Readiness",
  "treasury-health": "Treasury Health",
  "working-capital": "Working Capital",
  operational: "Operational",
  compliance: "Compliance",
};

export function ExecutiveScorecardView({ scorecard, onRoleChange, role }: ExecutiveScorecardViewProps) {
  const [roleOpen, setRoleOpen] = useState(false);

  const scores: FinancialScoreData[] = scorecard.scores
    ? Object.entries(scorecard.scores).map(([key, val]) => ({
        id: `${scorecard.id}-${key}`,
        companyId: scorecard.companyId,
        scoreType: key as FinancialScoreData["scoreType"],
        score: val as number,
        severity: (val as number) >= 80 ? "good" : (val as number) >= 60 ? "normal" : (val as number) >= 40 ? "warning" : "critical",
        calculatedAt: scorecard.generatedAt,
        createdAt: scorecard.generatedAt,
      }))
    : [];

  const kpis: KPIValueData[] = scorecard.kpis
    ? Object.entries(scorecard.kpis).map(([key, val]) => ({
        id: `${scorecard.id}-kpi-${key}`,
        companyId: scorecard.companyId,
        kpiKey: key,
        label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        category: "executive" as const,
        currentValue: val as number,
        status: "neutral" as const,
        recordedAt: scorecard.generatedAt,
      }))
    : [];

  const recommendations: IntelligenceRecommendationData[] = scorecard.recommendations
    ? (scorecard.recommendations as Array<Record<string, unknown>>).map((r, i) => ({
        id: `${scorecard.id}-rec-${i}`,
        companyId: scorecard.companyId,
        category: "general",
        title: (r.title as string) ?? "Untitled",
        reason: (r.reason as string) ?? "",
        confidence: (r.confidence as "high" | "medium" | "low") ?? "medium",
        priority: (r.priority as "critical" | "high" | "normal" | "low") ?? "normal",
        status: "active",
        createdAt: scorecard.generatedAt,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="relative">
            <button
              onClick={() => setRoleOpen(!roleOpen)}
              className="flex items-center gap-1.5 text-lg font-semibold text-white capitalize hover:text-amber-400 transition-colors"
            >
              {role.replace(/-/g, " ")}
              <ChevronDown className={cn("h-4 w-4 text-zinc-500 transition-transform", roleOpen && "rotate-180")} />
            </button>
            {roleOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 z-10 mt-1 w-40 rounded-lg border border-white/[0.06] bg-zinc-900 py-1 shadow-xl"
              >
                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => { onRoleChange?.(r); setRoleOpen(false); }}
                    className={cn(
                      "w-full px-3 py-1.5 text-left text-xs capitalize transition-colors",
                      r === role ? "text-amber-400 bg-amber-500/10" : "text-zinc-400 hover:text-white hover:bg-zinc-800",
                    )}
                  >
                    {r.replace(/-/g, " ")}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
          <p className="text-xs text-zinc-500">
            {new Date(scorecard.periodStart).toLocaleDateString()} — {new Date(scorecard.periodEnd).toLocaleDateString()}
          </p>
        </div>
        <span className="rounded-full border border-white/[0.06] bg-zinc-900/60 px-2.5 py-1 text-[10px] font-medium text-zinc-400">
          Scorecard
        </span>
      </div>

      {scorecard.summary && (
        <p className="rounded-lg border border-white/[0.06] bg-amber-500/[0.02] px-4 py-3 text-xs leading-relaxed text-zinc-300">
          {scorecard.summary}
        </p>
      )}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {scores.map((s) => (
          <div key={s.scoreType} className="flex flex-col items-center">
            <HealthScoreRing score={s.score} label="" size="sm" />
            <span className="mt-1.5 text-[10px] text-zinc-500 text-center">{SCORE_LABELS[s.scoreType] ?? s.scoreType}</span>
          </div>
        ))}
      </div>

      {kpis.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Key Performance Indicators</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {kpis.slice(0, 9).map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} />
            ))}
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Prioritized Recommendations</h4>
          <div className="space-y-2">
            {recommendations.slice(0, 5).map((r) => (
              <RecommendationCard key={r.id} recommendation={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
