"use client";

import type { WorkflowStatus } from "./types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Clock,
  User,
  AlertTriangle,
  Gauge,
  Timer,
} from "lucide-react";

interface Props {
  status: WorkflowStatus;
  compact?: boolean;
}

function RiskBadge({ level }: { level: WorkflowStatus["riskLevel"] }) {
  const variants: Record<string, { label: string; className: string }> = {
    low: { label: "Low Risk", className: "bg-gold/10 text-gold border-gold/20" },
    medium: { label: "Medium Risk", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    high: { label: "High Risk", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
    critical: { label: "Critical", className: "bg-red-500/10 text-red-400 border-red-500/20" },
  };
  const v = variants[level] ?? variants.low;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", v.className)}>
      <AlertTriangle className="h-3 w-3" />
      {v.label}
    </span>
  );
}

export function WorkflowStatusBar({ status, compact = false }: Props) {
  return (
    <div className={cn(
      "grid gap-3",
      compact ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-4",
    )}>
      {/* Current Owner */}
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-zinc-900/40 px-3 py-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/10 border border-gold/20 shrink-0">
          <User className="h-3.5 w-3.5 text-gold" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Owner</p>
          <p className="text-xs font-medium text-white truncate">{status.currentOwner}</p>
        </div>
      </div>

      {/* Waiting Duration */}
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-zinc-900/40 px-3 py-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 border border-white/[0.06] shrink-0">
          <Timer className="h-3.5 w-3.5 text-zinc-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Elapsed</p>
          <p className="text-xs font-medium text-white">{status.totalElapsed}</p>
        </div>
      </div>

      {/* SLA */}
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-zinc-900/40 px-3 py-2.5">
        <div className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg shrink-0",
          status.slaRemaining === "Overdue" ? "bg-red-500/10 border border-red-500/20" : "bg-zinc-800 border border-white/[0.06]",
        )}>
          <Clock className={cn("h-3.5 w-3.5", status.slaRemaining === "Overdue" ? "text-red-400" : "text-zinc-400")} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">SLA</p>
          <p className={cn("text-xs font-medium", status.slaRemaining === "Overdue" ? "text-red-400" : "text-white")}>
            {status.slaRemaining}
          </p>
        </div>
      </div>

      {/* Risk Level */}
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-zinc-900/40 px-3 py-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 border border-white/[0.06] shrink-0">
          <Gauge className="h-3.5 w-3.5 text-zinc-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Risk</p>
          <RiskBadge level={status.riskLevel} />
        </div>
      </div>

      {/* Bottleneck indicator (shown when applicable) */}
      {status.bottleneck && (
        <div className="sm:col-span-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-300">
            Bottleneck detected — {status.bottleneckReason ?? "Action required"}
          </p>
        </div>
      )}
    </div>
  );
}
