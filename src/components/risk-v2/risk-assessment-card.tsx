"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { RiskAssessment } from "./risk-types";

interface RiskAssessmentCardProps {
  assessments: RiskAssessment[];
  max?: number;
}

function ScoreBar({ label, value, maxScore = 25 }: { label: string; value: number; maxScore?: number }) {
  const pct = Math.min((value / maxScore) * 100, 100);
  const color = pct >= 80 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : pct >= 40 ? "bg-yellow-500" : "bg-emerald-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-500">{label}</span>
        <span className="text-zinc-300">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export const RiskAssessmentCard = memo(function RiskAssessmentCard({ assessments, max = 10 }: RiskAssessmentCardProps) {
  const recent = [...assessments].sort((a, b) => b.assessmentDate.getTime() - a.assessmentDate.getTime()).slice(0, max);

  return (
    <div className="space-y-3">
      {recent.map((a) => (
        <div key={a.id} className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Assessment: {a.id}</p>
              <p className="text-xs text-zinc-500">Method: {a.methodology} • By: {a.assessedBy}</p>
            </div>
            <span className="text-xs text-zinc-500">{a.assessmentDate.toLocaleDateString()}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 rounded-md bg-zinc-800/40 p-3">
              <p className="text-xs font-medium text-zinc-400">Inherent Risk</p>
              <ScoreBar label="Likelihood" value={a.inherentLikelihood} maxScore={5} />
              <ScoreBar label="Impact" value={a.inherentImpact} maxScore={5} />
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Score</span>
                <span className="font-medium text-white">{a.inherentScore.toFixed(1)}</span>
              </div>
            </div>
            <div className="space-y-2 rounded-md bg-zinc-800/40 p-3">
              <p className="text-xs font-medium text-zinc-400">Residual Risk</p>
              <ScoreBar label="Likelihood" value={a.residualLikelihood} maxScore={5} />
              <ScoreBar label="Impact" value={a.residualImpact} maxScore={5} />
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Score</span>
                <span className="font-medium text-white">{a.residualScore.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      {recent.length === 0 && (
        <p className="py-8 text-center text-sm text-zinc-500">No assessments found</p>
      )}
    </div>
  );
});
