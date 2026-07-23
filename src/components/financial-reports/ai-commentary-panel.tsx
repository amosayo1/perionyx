"use client";

import { cn } from "@/lib/utils";
import { AnimatedCard } from "@/components/enterprise/motion/animated-card";
import { SectionTransition, SectionItem } from "@/components/enterprise/motion/section-transition";
import { LoadingSkeleton, SkeletonGroup } from "@/components/enterprise/motion/loading-skeleton";
import type { AICommentary, AICommentarySegment } from "@/modules/financial-reporting/types";
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb,
  Info, Brain, ArrowUp, ArrowDown
} from "lucide-react";

interface AiCommentaryPanelProps {
  commentary: AICommentary | null;
  loading?: boolean;
}

const severityColors: Record<string, { border: string; bg: string; text: string }> = {
  positive: { border: "border-emerald-400/30", bg: "bg-emerald-400/5", text: "text-emerald-400" },
  negative: { border: "border-red-400/30", bg: "bg-red-400/5", text: "text-red-400" },
  warning: { border: "border-amber-400/30", bg: "bg-amber-400/5", text: "text-amber-400" },
  neutral: { border: "border-zinc-600/30", bg: "bg-zinc-800/30", text: "text-zinc-400" },
};

const segmentIcons: Record<string, typeof Info> = {
  insight: Info,
  risk: AlertTriangle,
  recommendation: Lightbulb,
  observation: Info,
  trend: TrendingUp,
};

const trendIcons: Record<string, typeof ArrowUp> = {
  up: ArrowUp,
  down: ArrowDown,
  neutral: Minus,
};

const trendColors: Record<string, string> = {
  up: "text-emerald-400",
  down: "text-red-400",
  neutral: "text-zinc-500",
};

function SegmentCard({ segment }: { segment: AICommentarySegment }) {
  const Icon = segmentIcons[segment.type] || Info;
  const colors = severityColors[segment.severity || "neutral"];

  return (
    <div className={cn("rounded-xl border p-4", colors.border, colors.bg)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", colors.text)} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-medium capitalize", colors.text)}>{segment.type}</span>
            {segment.metric && (
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">{segment.metric}</span>
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-300">{segment.content}</p>
          {(segment.value != null || segment.change != null) && (
            <div className="mt-2 flex items-center gap-3 text-xs">
              {segment.value != null && (
                <span className="text-zinc-400">
                  Value: <span className="font-medium text-white">{segment.value.toLocaleString()}</span>
                </span>
              )}
              {segment.change != null && (
                <span className={cn("font-medium", segment.change >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {segment.change >= 0 ? "+" : ""}{segment.change.toFixed(1)}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AiCommentaryPanel({ commentary, loading }: AiCommentaryPanelProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonGroup count={1} variant="metric" />
        <SkeletonGroup count={3} variant="card" />
      </div>
    );
  }

  if (!commentary) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Brain className="mb-3 h-8 w-8 text-zinc-700" />
        <p className="text-sm text-zinc-500">No AI commentary available</p>
        <p className="mt-1 text-xs text-zinc-600">Run a report with AI commentary enabled to see insights here.</p>
      </div>
    );
  }

  return (
    <SectionTransition>
      <div className="space-y-5">
        <AnimatedCard className="border-amber-400/30 bg-amber-400/5 p-4">
          <div className="flex items-start gap-3">
            <Brain className="mt-0.5 h-5 w-5 text-amber-400" />
            <div>
              <p className="text-xs font-medium text-amber-400">Executive Summary</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-300">{commentary.summary}</p>
              <div className="mt-3 flex items-center gap-3 text-[11px] text-zinc-600">
                <span>Generated {new Date(commentary.generatedAt).toLocaleString()}</span>
                <span>·</span>
                <span>Model: {commentary.model}</span>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {commentary.keyMetrics.length > 0 && (
          <SectionItem>
            <p className="mb-3 text-xs font-medium text-zinc-500">Key Metrics</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {commentary.keyMetrics.map((metric, i) => {
                const TrendIcon = trendIcons[metric.trend] || Minus;
                return (
                  <AnimatedCard key={i} className="p-3">
                    <p className="text-[11px] text-zinc-500">{metric.label}</p>
                    <p className="mt-0.5 text-base font-semibold text-white">{metric.value}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <TrendIcon className={cn("h-3 w-3", trendColors[metric.trend])} />
                      <span className={cn("text-xs", trendColors[metric.trend])}>{metric.change}</span>
                    </div>
                  </AnimatedCard>
                );
              })}
            </div>
          </SectionItem>
        )}

        {commentary.segments.length > 0 && (
          <SectionItem>
            <p className="mb-3 text-xs font-medium text-zinc-500">Analysis</p>
            <div className="space-y-2">
              {commentary.segments.map((segment, i) => (
                <SegmentCard key={i} segment={segment} />
              ))}
            </div>
          </SectionItem>
        )}

        {commentary.risks.length > 0 && (
          <SectionItem>
            <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              Risks
            </p>
            <div className="space-y-2">
              {commentary.risks.map((risk, i) => (
                <div key={i} className="flex gap-2 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                  <p className="text-sm text-zinc-300">{risk}</p>
                </div>
              ))}
            </div>
          </SectionItem>
        )}

        {commentary.recommendations.length > 0 && (
          <SectionItem>
            <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
              Recommendations
            </p>
            <div className="space-y-2">
              {commentary.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2">
                  <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <p className="text-sm text-zinc-300">{rec}</p>
                </div>
              ))}
            </div>
          </SectionItem>
        )}
      </div>
    </SectionTransition>
  );
}
