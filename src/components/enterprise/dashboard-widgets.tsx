"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HealthIndicator } from "./health-indicator";
import { RiskIndicator } from "./risk-indicator";
import { ChevronDown, ChevronRight, Pin, PinOff, Lightbulb, ArrowRight, X } from "lucide-react";

interface ExpandableWidgetProps {
  title: string;
  description?: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  headerClassName?: string;
}

export function ExpandableWidget({ title, description, children, defaultExpanded = true, className, headerClassName }: ExpandableWidgetProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={cn("rounded-2xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30", className)}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.02]",
          headerClassName,
        )}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{title}</p>
          {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />
        )}
      </button>
      {expanded && <div className="border-t border-white/[0.04] px-5 py-4">{children}</div>}
    </div>
  );
}

interface PinnedWidgetsProps {
  children: ReactNode;
  className?: string;
}

export function PinnedWidgets({ children, className }: PinnedWidgetsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
        <Pin className="h-3.5 w-3.5" />
        Pinned
      </div>
      {children}
    </div>
  );
}

interface HealthRiskWidgetProps {
  title: string;
  type: "health" | "risk";
  status?: string;
  level?: string;
  score?: number;
  maxScore?: number;
  children?: ReactNode;
  className?: string;
}

export function HealthRiskWidget({ title, type, status, level, score, maxScore = 100, children, className }: HealthRiskWidgetProps) {
  return (
    <div className={cn("rounded-2xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30 p-5", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
          {title}
        </div>
        {type === "health" && status && <HealthIndicator status={status} />}
        {type === "risk" && level && <RiskIndicator level={level} />}
      </div>
      {score !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Score</span>
            <span className="text-white font-medium">{score}/{maxScore}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                score >= 80 ? "bg-emerald-400" : score >= 60 ? "bg-amber-400" : "bg-red-400",
              )}
              style={{ width: `${(score / maxScore) * 100}%` }}
            />
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

interface RecommendedAction {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  onClick: () => void;
  priority?: "high" | "medium" | "low";
}

interface RecommendedActionsProps {
  actions: RecommendedAction[];
  title?: string;
  className?: string;
}

export function RecommendedActions({ actions, title = "Recommended Actions", className }: RecommendedActionsProps) {
  if (!actions.length) return null;

  return (
    <div className={cn("rounded-2xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30 p-5", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-gold" />
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">{title}</span>
      </div>
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="flex w-full items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 text-left transition-all hover:border-gold/20 hover:bg-gold/5"
          >
            {action.icon && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                {action.icon}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">{action.label}</p>
              {action.description && <p className="text-xs text-zinc-500 mt-0.5">{action.description}</p>}
            </div>
            {action.priority === "high" && (
              <Badge variant="warning" className="shrink-0">High</Badge>
            )}
            <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600" />
          </button>
        ))}
      </div>
    </div>
  );
}

interface ExecutiveSummaryProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function ExecutiveSummary({ title = "Executive Summary", children, className }: ExecutiveSummaryProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-gold/10 bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-black/50 p-6 lg:p-8", className)}>
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold opacity-[0.03] blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/80 mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          {title}
        </div>
        {children}
      </div>
    </div>
  );
}

interface DismissibleBannerProps {
  children: ReactNode;
  id: string;
  className?: string;
}

export function DismissibleBanner({ children, id, className }: DismissibleBannerProps) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    try { return localStorage.getItem(`banner-dismissed-${id}`) === "true"; } catch { return false; }
  });

  if (dismissed) return null;

  return (
    <div className={cn("relative rounded-xl border border-gold/20 bg-gold/5 p-4", className)}>
      <button
        onClick={() => { setDismissed(true); try { localStorage.setItem(`banner-dismissed-${id}`, "true"); } catch {} } }
        className="absolute right-3 top-3 rounded-full p-0.5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      {children}
    </div>
  );
}
