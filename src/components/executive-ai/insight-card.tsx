"use client";

import { memo, useState } from "react";
import { Brain, ChevronDown, ChevronUp, AlertTriangle, Info, DollarSign, TrendingUp, Shield, PiggyBank, FileText, Scale, Lightbulb, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExecutiveInsight } from "./ai-types";

const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  financial: { icon: <DollarSign className="h-4 w-4" />, color: "text-emerald-400" },
  operational: { icon: <Activity className="h-4 w-4" />, color: "text-blue-400" },
  risk: { icon: <AlertTriangle className="h-4 w-4" />, color: "text-red-400" },
  compliance: { icon: <Scale className="h-4 w-4" />, color: "text-purple-400" },
  treasury: { icon: <Shield className="h-4 w-4" />, color: "text-gold" },
  tax: { icon: <FileText className="h-4 w-4" />, color: "text-amber-400" },
  investments: { icon: <TrendingUp className="h-4 w-4" />, color: "text-cyan-400" },
  revenue: { icon: <TrendingUp className="h-4 w-4" />, color: "text-emerald-400" },
  cost: { icon: <DollarSign className="h-4 w-4" />, color: "text-red-400" },
  fraud: { icon: <AlertTriangle className="h-4 w-4" />, color: "text-red-500" },
  anomaly: { icon: <Activity className="h-4 w-4" />, color: "text-amber-400" },
  forecast: { icon: <TrendingUp className="h-4 w-4" />, color: "text-blue-400" },
  recommendation: { icon: <Lightbulb className="h-4 w-4" />, color: "text-gold" },
};

const CONFIDENCE_COLORS: Record<string, string> = {
  "very-high": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  high: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  low: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "very-low": "text-red-400 bg-red-500/10 border-red-500/20",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "text-red-400 bg-red-500/10 border-red-500/20",
  high: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  low: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

interface InsightCardProps {
  insight: ExecutiveInsight;
  onAcknowledge?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export const InsightCard = memo(function InsightCard({ insight, onAcknowledge, onDismiss }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const catConfig = CATEGORY_CONFIG[insight.category] || { icon: <Brain className="h-4 w-4" />, color: "text-zinc-400" };

  return (
    <div className={cn(
      "rounded-lg border transition-colors",
      expanded ? "border-zinc-700/60 bg-zinc-900/60" : "border-zinc-800/60 bg-zinc-900/40",
      "hover:border-zinc-700/60"
    )}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left"
      >
        <div className={cn("mt-0.5 flex-shrink-0", catConfig.color)}>
          {catConfig.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{insight.title}</span>
            <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider", SEVERITY_COLORS[insight.severity])}>
              {insight.severity}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">{insight.sourceDomain} · {insight.category}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-medium", CONFIDENCE_COLORS[insight.confidence])}>
            {insight.confidence.replace("-", " ")}
          </span>
          {expanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-zinc-800/40 px-4 pb-3">
          <p className="mt-2 text-sm text-zinc-400">{insight.description}</p>

          {Object.keys(insight.metrics).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(insight.metrics).map(([key, val]) => (
                <span key={key} className="rounded-md bg-zinc-800/60 px-2 py-1 text-[11px] text-zinc-400">
                  {key.replace(/([A-Z])/g, " $1").trim()}: <span className="text-zinc-300">{typeof val === "number" ? val.toLocaleString() : val}</span>
                </span>
              ))}
            </div>
          )}

          {insight.recommendations.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-[11px] font-medium text-zinc-500">Recommendations:</p>
              {insight.recommendations.map((r, i) => (
                <p key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-400">
                  <span className="mt-0.5 text-gold">•</span>
                  {r}
                </p>
              ))}
            </div>
          )}

          {insight.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {insight.tags.map(tag => (
                <span key={tag} className="rounded-md border border-zinc-700/40 bg-zinc-800/40 px-1.5 py-0.5 text-[10px] text-zinc-500">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-600">
            <span>Status: {insight.status}</span>
            <span>·</span>
            <span>{new Date(insight.detectedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>

          {(onAcknowledge || onDismiss) && (
            <div className="mt-2 flex gap-2">
              {insight.status === "new" && onAcknowledge && (
                <button
                  onClick={() => onAcknowledge(insight.id)}
                  className="rounded-md border border-emerald-500/20 px-2 py-1 text-[11px] font-medium text-emerald-400 transition-colors hover:bg-emerald-500/10"
                >
                  Acknowledge
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={() => onDismiss(insight.id)}
                  className="rounded-md border border-zinc-700/40 px-2 py-1 text-[11px] text-zinc-500 transition-colors hover:bg-zinc-800/60"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
