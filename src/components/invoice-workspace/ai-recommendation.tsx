"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { AiRecommendation } from "@/modules/ai";

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "bg-emerald-500/20 text-emerald-300",
  medium: "bg-yellow-500/20 text-yellow-300",
  low: "bg-zinc-500/20 text-zinc-300",
};

function confidenceLevel(score: number): string {
  if (score >= 0.7) return "high";
  if (score >= 0.4) return "medium";
  return "low";
}

function confidenceLabel(score: number): string {
  if (score >= 0.7) return "High Confidence";
  if (score >= 0.4) return "Medium Confidence";
  return "Low Confidence";
}

interface AiRecommendationProps {
  recommendation: AiRecommendation | null;
}

export function AiRecommendationSection({ recommendation }: AiRecommendationProps) {
  if (!recommendation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">AI recommendation is not available for this invoice.</p>
        </CardContent>
      </Card>
    );
  }

  const level = confidenceLevel(recommendation.confidence);
  const color = CONFIDENCE_COLORS[level] ?? "bg-zinc-500/20 text-zinc-300";

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Recommendation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
            {confidenceLabel(recommendation.confidence)}
          </span>
          <span className="text-xs text-zinc-500">
            {Math.round(recommendation.confidence * 100)}% confidence
          </span>
        </div>

        <p className="mt-4 text-sm font-medium text-white">{recommendation.recommendation}</p>
        <p className="mt-2 text-sm text-zinc-400">{recommendation.reason}</p>

        {recommendation.supportingEvidence.length > 0 && (
          <div className="mt-4">
            <span className="text-xs font-medium text-zinc-400">Supporting Evidence</span>
            <ul className="mt-2 space-y-1">
              {recommendation.supportingEvidence.map((evidence, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-500" />
                  {evidence}
                </li>
              ))}
            </ul>
          </div>
        )}

        {recommendation.suggestedAction && (
          <div className="mt-4 rounded-md bg-white/[0.03] px-4 py-3">
            <span className="text-xs font-medium text-zinc-400">Suggested Action</span>
            <p className="mt-1 text-sm text-white">{recommendation.suggestedAction}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
