"use client";

import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, FileCheck, Gavel, ClipboardList, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCard } from "@/components/enterprise/motion/animated-card";
import type { TaskCategory, TodaysWorkResult } from "@/modules/todays-work";

interface TodaysWorkCardProps {
  label: string;
  count: number;
  effort: string;
  urgency: string;
  reason: string;
  icon: typeof AlertTriangle;
  color: string;
  navigationTarget: string;
  onNavigate: (target: string) => void;
}

function WorkCard({ label, count, effort, urgency, reason, icon: Icon, color, navigationTarget, onNavigate }: TodaysWorkCardProps) {
  const urgencyDot =
    urgency === "critical" ? "bg-red-500" :
    urgency === "high" ? "bg-amber-500" :
    urgency === "medium" ? "bg-blue-500" :
    "bg-zinc-500";

  return (
    <AnimatedCard hoverEffect="elevate" onClick={() => onNavigate(navigationTarget)} className="cursor-pointer p-4">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", color)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-zinc-500">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white">{count}</p>
            <span className="text-[11px] text-zinc-600">{effort}</span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className={cn("h-1.5 w-1.5 rounded-full", urgencyDot)} />
        <span className="flex items-center gap-1 text-[11px] text-zinc-500">
          <Info className="h-3 w-3" />
          {reason}
        </span>
      </div>
    </AnimatedCard>
  );
}

type ViewState = "loading" | "empty" | "error" | "partial" | "ready";

interface DashboardTodaysWorkProps {
  state?: ViewState;
  data?: TodaysWorkResult;
  className?: string;
}

const CATEGORY_CONFIG: Record<string, { icon: typeof AlertTriangle; color: string }> = {
  "high-priority-reviews": { icon: AlertTriangle, color: "border-red-500/20 bg-red-500/10 text-red-400" },
  "medium-priority-reviews": { icon: ClipboardList, color: "border-amber-500/20 bg-amber-500/10 text-amber-400" },
  "quick-approvals": { icon: FileCheck, color: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" },
  "policy-exceptions": { icon: Gavel, color: "border-purple-500/20 bg-purple-500/10 text-purple-400" },
};

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-zinc-800" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 rounded bg-zinc-800" />
          <div className="flex items-baseline gap-2">
            <div className="h-7 w-12 rounded bg-zinc-800" />
            <div className="h-3 w-14 rounded bg-zinc-800" />
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
        <div className="h-3 w-48 rounded bg-zinc-800" />
      </div>
    </div>
  );
}

export const DashboardTodaysWork = memo(function DashboardTodaysWork({
  state = "ready",
  data,
  className,
}: DashboardTodaysWorkProps) {
  const router = useRouter();
  const handleNavigate = useCallback(
    (target: string) => router.push(target),
    [router],
  );

  if (state === "loading") {
    return (
      <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={cn("rounded-xl border border-red-900/30 bg-red-900/10 p-5", className)}>
        <p className="text-[13px] text-red-400">Unable to load today&apos;s tasks. Please try again.</p>
      </div>
    );
  }

  if (state === "empty" || !data || data.categories.length === 0) {
    return (
      <div className={cn("rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-5", className)}>
        <p className="text-[13px] text-zinc-500">No pending tasks. All caught up.</p>
        {data && data.totalTasks > 0 && (
          <p className="mt-1 text-[12px] text-zinc-600">
            {data.totalTasks} tasks completed today
          </p>
        )}
      </div>
    );
  }

  const isPartial = state === "partial";

  return (
    <div>
      {isPartial && (
        <p className="mb-3 flex items-center gap-1.5 text-[12px] text-amber-400">
          <Info className="h-3.5 w-3.5" />
          Some task data may be incomplete
        </p>
      )}
      <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
        {data.categories.map((cat: TaskCategory) => {
          const config = CATEGORY_CONFIG[cat.id] ?? { icon: ClipboardList, color: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400" };
          return (
            <WorkCard
              key={cat.id}
              label={cat.label}
              count={cat.count}
              effort={cat.estimatedEffort}
              urgency={cat.urgency}
              reason={cat.supportingReason}
              icon={config.icon}
              color={config.color}
              navigationTarget={cat.navigationTarget}
              onNavigate={handleNavigate}
            />
          );
        })}
      </div>
    </div>
  );
});
