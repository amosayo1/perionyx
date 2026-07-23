"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { HealthScoreRing } from "./health-score-ring";
import { ScoreCard } from "./score-card";
import { KpiCard } from "./kpi-card";
import { RecommendationList } from "./recommendation-list";
import { InsightTimeline } from "./insight-timeline";
import { HealthAlertBanner } from "./health-alert-banner";
import { DollarSign, TrendingUp } from "lucide-react";
import type { HealthDashboardData, FinancialScoreData } from "@/modules/intelligence-platform/types";

interface HealthDashboardGridProps {
  dashboard: HealthDashboardData;
  onScoreClick: (scoreType: string) => void;
  onRecommendationClick: (id: string) => void;
}

const SCORE_TYPES: Array<{ key: string; label: string }> = [
  { key: "integrity", label: "Data Integrity" },
  { key: "close-readiness", label: "Close Readiness" },
  { key: "treasury-health", label: "Treasury Health" },
  { key: "working-capital", label: "Working Capital" },
  { key: "operational", label: "Operational" },
  { key: "compliance", label: "Compliance" },
];

export function HealthDashboardGrid({ dashboard, onScoreClick, onRecommendationClick }: HealthDashboardGridProps) {
  const scoreMap = useMemo(() => {
    const map = new Map<string, FinancialScoreData>();
    for (const s of dashboard.scores) {
      map.set(s.scoreType, s);
    }
    return map;
  }, [dashboard.scores]);

  const allScoresPresent = SCORE_TYPES.every((st) => scoreMap.has(st.key));

  return (
    <div className="space-y-5">
      {dashboard.cashPosition != null && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/[0.02] px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <DollarSign className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Cash Position</p>
              <p className="text-2xl font-bold text-white">
                ${dashboard.cashPosition.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+2.4%</span>
          </div>
        </motion.div>
      )}

      <HealthAlertBanner alerts={dashboard.alerts} onResolve={(id) => {}} />

      <div>
        <h3 className="mb-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Financial Health Scores</h3>
        {allScoresPresent ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {SCORE_TYPES.map((st) => {
              const s = scoreMap.get(st.key)!;
              return (
                <motion.button
                  key={st.key}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onScoreClick(st.key)}
                  className="flex flex-col items-center rounded-xl border border-white/[0.06] bg-zinc-900/60 px-3 py-4 hover:border-white/[0.12] transition-colors"
                >
                  <HealthScoreRing score={s.score} label="" size="sm" previousScore={s.previousScore} />
                  <span className="mt-2 text-[10px] text-zinc-500 text-center">{st.label}</span>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dashboard.scores.map((s) => (
              <ScoreCard key={s.id} score={s} onClick={() => onScoreClick(s.scoreType)} />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Key Metrics</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {dashboard.kpis.slice(0, 8).map((kpi) => (
            <div key={kpi.id} className="min-w-[200px] shrink-0">
              <KpiCard kpi={kpi} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2 lg:col-span-1">
          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Recommendations</h3>
          <RecommendationList
            recommendations={dashboard.recommendations.slice(0, 5)}
            onAcknowledge={(id) => onRecommendationClick(id)}
            onDismiss={(id) => {}}
          />
        </div>
        <div className="space-y-2 lg:col-span-1">
          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Insights</h3>
          <InsightTimeline
            events={dashboard.insights.slice(0, 8)}
            onMarkRead={() => {}}
            onLoadMore={() => {}}
            hasMore={dashboard.insights.length > 8}
          />
        </div>
        <div className="space-y-2 lg:col-span-1">
          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Trends</h3>
          <div className="space-y-2">
            {dashboard.trendSummaries.slice(0, 5).map((t, i) => (
              <div
                key={t.key}
                className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3 py-2.5"
              >
                <span className="text-xs text-zinc-400">{t.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "text-xs font-medium",
                    t.direction === "up" ? "text-emerald-400" : t.direction === "down" ? "text-red-400" : "text-zinc-400",
                  )}>
                    {t.direction === "up" ? "↑" : t.direction === "down" ? "↓" : "→"}
                  </span>
                  {t.changePercent != null && (
                    <span className="text-xs text-zinc-500">{t.changePercent.toFixed(1)}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
