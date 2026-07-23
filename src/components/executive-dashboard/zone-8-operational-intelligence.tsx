"use client";

import { memo } from "react";
import { AlertCircle, Clock, GitBranch, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DashboardCard } from "./dashboard-card";

interface Zone8Props {
  bottlenecks?: { process: string; delay: string; severity: "high" | "medium" | "low" }[];
  pendingApprovals?: number;
  slowProcesses?: number;
  automationOpportunities?: number;
  optimizationSuggestions?: number;
  className?: string;
}

export const Zone8OperationalIntelligence = memo(function Zone8OperationalIntelligence({
  bottlenecks,
  pendingApprovals = 0,
  slowProcesses = 0,
  automationOpportunities = 0,
  optimizationSuggestions = 0,
  className,
}: Zone8Props) {
  const defaultBottlenecks = bottlenecks ?? [
    { process: "Invoice approval chain", delay: "Avg 4.2h", severity: "high" as const },
    { process: "Month-end reconciliation", delay: "Behind schedule", severity: "medium" as const },
    { process: "Payment batch processing", delay: "Queue buildup", severity: "medium" as const },
  ];

  const summaryItems = [
    { label: "Pending Approvals", value: pendingApprovals, icon: Clock, color: "text-amber-400 bg-amber-500/10" },
    { label: "Slow Processes", value: slowProcesses, icon: AlertCircle, color: "text-red-400 bg-red-500/10" },
    { label: "Automation Opps", value: automationOpportunities, icon: GitBranch, color: "text-cyan-400 bg-cyan-500/10" },
    { label: "Optimizations", value: optimizationSuggestions, icon: Zap, color: "text-emerald-400 bg-emerald-500/10" },
  ];

  return (
    <DashboardCard
      title="Operational Intelligence"
      description="Workflow bottlenecks, automation opportunities"
      size="third"
      className={className}
    >
      <div className="grid grid-cols-2 gap-2">
        {summaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-lg bg-zinc-800/30 p-2.5">
              <div className={cn("flex h-6 w-6 items-center justify-center rounded-md", item.color)}>
                <Icon className="h-3 w-3" />
              </div>
              <p className="mt-1.5 text-[16px] font-bold text-white">{item.value}</p>
              <p className="text-[9px] text-zinc-500">{item.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-3">
        <p className="mb-1.5 text-[11px] font-medium text-zinc-500">Active Bottlenecks</p>
        <div className="space-y-1">
          {defaultBottlenecks.map((b, i) => (
            <div key={i} className="flex items-center justify-between rounded-md bg-zinc-800/20 px-2.5 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    b.severity === "high" && "bg-red-500",
                    b.severity === "medium" && "bg-amber-500",
                    b.severity === "low" && "bg-zinc-500",
                  )}
                />
                <span className="truncate text-[12px] text-zinc-300">{b.process}</span>
              </div>
              <span className="shrink-0 text-[10px] text-zinc-500">{b.delay}</span>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/automation-studio"
        className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-800/40 py-2 text-[12px] font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      >
        Open Operations Center
      </Link>
    </DashboardCard>
  );
});
