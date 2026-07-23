"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "./dashboard-card";
import { HealthScorecard } from "./charts";
import type { HealthScore } from "./types";

interface Zone5Props {
  scores: HealthScore[];
  className?: string;
}

export const Zone5EnterpriseHealth = memo(function Zone5EnterpriseHealth({ scores, className }: Zone5Props) {
  const defaultScores: HealthScore[] = scores.length > 0 ? scores : [
    { label: "System Health", score: 92, maxScore: 100, status: "healthy", trend: "up" },
    { label: "Financial Health", score: 85, maxScore: 100, status: "healthy", trend: "flat" },
    { label: "Treasury Health", score: 78, maxScore: 100, status: "warning", trend: "down" },
    { label: "Compliance", score: 95, maxScore: 100, status: "healthy", trend: "up" },
    { label: "Operational Health", score: 88, maxScore: 100, status: "healthy", trend: "up" },
    { label: "Workflow Health", score: 72, maxScore: 100, status: "warning", trend: "down" },
  ];

  const avgScore = Math.round(defaultScores.reduce((s, h) => s + (h.score / h.maxScore) * 100, 0) / defaultScores.length);

  return (
    <DashboardCard
      title="Enterprise Health"
      description="System-wide health scorecards"
      size="half"
      className={className}
    >
      <div className="mb-4 flex items-center gap-4 rounded-lg bg-zinc-800/30 p-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-500/30 bg-emerald-500/5">
          <span className="text-xl font-bold text-emerald-400">{avgScore}%</span>
        </div>
        <div>
          <p className="text-[13px] font-medium text-zinc-200">Overall Enterprise Health</p>
          <p className="text-[11px] text-zinc-500">
            {avgScore >= 90 ? "Excellent — all systems nominal" :
             avgScore >= 75 ? "Good — minor attention needed" :
             "Needs improvement — review warnings"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {defaultScores.map((h) => (
          <HealthScorecard
            key={h.label}
            label={h.label}
            score={h.score}
            maxScore={h.maxScore}
            status={h.status}
            trend={h.trend}
            size="sm"
          />
        ))}
      </div>
    </DashboardCard>
  );
});
