"use client";

import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ApprovalStep {
  role: string;
  status: "pending" | "approved" | "rejected" | "escalated" | "skipped";
  user?: string;
  timestamp?: Date;
  delayMinutes?: number;
}

interface ApprovalPreviewProps {
  steps: ApprovalStep[];
  title?: string;
  mode?: "sequential" | "parallel";
  className?: string;
}

const STATUS_CONFIG = {
  pending: { icon: Clock, color: "text-zinc-500", bg: "bg-zinc-800/50" },
  approved: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  rejected: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
  escalated: { icon: ArrowRight, color: "text-amber-400", bg: "bg-amber-500/10" },
  skipped: { icon: ShieldCheck, color: "text-zinc-600", bg: "bg-zinc-800/30" },
};

export const ApprovalPreview = memo(function ApprovalPreview({
  steps,
  title = "Approval Path",
  mode = "sequential",
  className,
}: ApprovalPreviewProps) {
  const simulationPath = useMemo(() => {
    if (mode === "parallel") return steps;
    return steps;
  }, [steps, mode]);

  if (!steps.length) {
    return (
      <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/30 p-4", className)}>
        <p className="text-xs font-medium text-zinc-500 mb-1">{title}</p>
        <p className="text-[11px] text-zinc-600">No approvers configured</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/30 p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-zinc-400">{title}</p>
        <Badge variant="outline" className="text-[9px] uppercase tracking-wider">
          {mode}
        </Badge>
      </div>

      <div className={cn(
        "relative",
        mode === "sequential" ? "space-y-3" : "flex flex-wrap gap-3",
      )}>
        {mode === "sequential" && (
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/[0.06]" aria-hidden />
        )}

        {simulationPath.map((step, i) => {
          const config = STATUS_CONFIG[step.status];
          const Icon = config.icon;

          return (
            <div key={i} className={cn("relative flex items-start gap-3", mode === "parallel" ? "flex-1 min-w-[160px]" : "")}>
              {mode === "sequential" && (
                <span className={cn(
                  "relative z-10 flex h-5 w-5 items-center justify-center rounded-full",
                  config.bg,
                )}>
                  <Icon className={cn("h-3 w-3", config.color)} />
                </span>
              )}

              <div className={cn(
                "flex-1 rounded-lg border px-3 py-2",
                step.status === "pending" ? "border-white/[0.04]" : config.bg,
                step.status === "pending" ? "" : "border-transparent",
              )}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300">{step.role}</span>
                  {step.status !== "pending" && (
                    <span className={cn("text-[10px]", config.color)}>
                      {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                    </span>
                  )}
                </div>
                {step.user && (
                  <p className="text-[10px] text-zinc-500 mt-0.5">{step.user}</p>
                )}
                {step.delayMinutes && step.status === "pending" && (
                  <p className="text-[10px] text-zinc-600 mt-0.5">
                    Escalates after {step.delayMinutes}m
                  </p>
                )}
              </div>

              {mode === "sequential" && i < simulationPath.length - 1 && (
                <div className="absolute -bottom-2 left-[9px] z-10">
                  <ArrowRight className="h-3 w-3 -rotate-90 text-zinc-700" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
