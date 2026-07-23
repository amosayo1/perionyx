"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp } from "@/components/enterprise/motion/tokens";
import type { MorningBriefingData } from "@/modules/enterprise-experience/types";
import {
  ArrowDown, ArrowUp, Ban, CheckCircle2, ChevronRight,
  Clock, AlertTriangle, AlertCircle,
} from "lucide-react";

function KpiBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    on_track: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    at_risk: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    critical: "border-red-500/20 bg-red-500/10 text-red-400",
  };
  const labels: Record<string, string> = {
    on_track: "On Track", at_risk: "At Risk", critical: "Critical",
  };
  return (
    <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", colors[status] ?? colors.critical)}>
      {labels[status] ?? status}
    </span>
  );
}

function SeverityDot({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    low: "bg-zinc-500", medium: "bg-amber-400", high: "bg-orange-500", critical: "bg-red-500",
  };
  return <span className={cn("inline-block h-2 w-2 rounded-full", colors[severity] ?? "bg-zinc-500")} />;
}

function ChangeIndicator({ change, direction }: { change: number; direction: "up" | "down" | "flat" }) {
  const ArrowIcon = direction === "up" ? ArrowUp : direction === "down" ? ArrowDown : null;
  const color = direction === "up" ? "text-emerald-400" : direction === "down" ? "text-red-400" : "text-zinc-400";
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", color)}>
      {ArrowIcon && <ArrowIcon className="h-3 w-3" />}
      {Math.abs(change)}%
    </span>
  );
}

interface MorningBriefingCardProps {
  briefing: MorningBriefingData;
  onMarkRead: () => void;
  onViewAll: () => void;
}

export function MorningBriefingCard({ briefing, onMarkRead, onViewAll }: MorningBriefingCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5"
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {briefing.title ?? "Morning Briefing"}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {new Date(briefing.date).toLocaleDateString("en-US", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>
        <span className={cn(
          "flex h-3 w-3 rounded-full",
          briefing.isRead ? "bg-zinc-600" : "bg-amber-400",
        )} />
      </div>

      {briefing.summary && (
        <p className="mb-4 text-sm text-zinc-400">{briefing.summary}</p>
      )}

      {briefing.highlights && briefing.highlights.length > 0 && (
        <div className="mb-4 space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Highlights</p>
          {briefing.highlights.map((h) => (
            <div key={h.label} className="flex items-center justify-between rounded-lg bg-zinc-900/60 px-3 py-2">
              <span className="text-sm text-zinc-300">{h.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{h.value}</span>
                <ChangeIndicator change={h.change} direction={h.direction} />
              </div>
            </div>
          ))}
        </div>
      )}

      {briefing.kpis && briefing.kpis.length > 0 && (
        <div className="mb-4 space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">KPI Status</p>
          <div className="flex flex-wrap gap-1.5">
            {briefing.kpis.map((kpi) => (
              <div key={kpi.label} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3 py-1.5">
                <span className="text-sm text-zinc-300">{kpi.label}: <span className="font-semibold text-white">{kpi.value}</span></span>
                <KpiBadge status={kpi.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
          <p className="text-xs text-zinc-500">Pending Approvals</p>
          <p className="text-lg font-bold text-white">{briefing.pendingApprovals}</p>
          {briefing.pendingApprovalAmount != null && (
            <p className="text-xs text-zinc-400">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(briefing.pendingApprovalAmount))}
            </p>
          )}
        </div>
        {briefing.cashPosition != null && (
          <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
            <p className="text-xs text-zinc-500">Cash Position</p>
            <p className="text-lg font-bold text-white">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(briefing.cashPosition))}
            </p>
            {briefing.cashChange != null && (
              <ChangeIndicator change={Number(briefing.cashChange)} direction={Number(briefing.cashChange) >= 0 ? "up" : "down"} />
            )}
          </div>
        )}
        {briefing.reconciliationStatus && (
          <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
            <p className="text-xs text-zinc-500">Reconciliation</p>
            <span className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              briefing.reconciliationStatus === "completed" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
              briefing.reconciliationStatus === "in_progress" && "border-amber-500/20 bg-amber-500/10 text-amber-400",
              briefing.reconciliationStatus === "failed" && "border-red-500/20 bg-red-500/10 text-red-400",
            )}>
              {briefing.reconciliationStatus === "completed" && <CheckCircle2 className="h-3 w-3" />}
              {briefing.reconciliationStatus === "in_progress" && <Clock className="h-3 w-3" />}
              {briefing.reconciliationStatus === "failed" && <Ban className="h-3 w-3" />}
              {briefing.reconciliationStatus.replace("_", " ")}
            </span>
          </div>
        )}
      </div>

      {briefing.risks && briefing.risks.length > 0 && (
        <div className="mb-4 space-y-1.5">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
            <AlertTriangle className="h-3 w-3 text-amber-400" />
            Risks
          </p>
          {briefing.risks.map((risk) => (
            <div key={risk.id} className="flex items-center gap-2 rounded-lg bg-zinc-900/60 px-3 py-2">
              <SeverityDot severity={risk.severity} />
              <span className="flex-1 text-sm text-zinc-300">{risk.message}</span>
              <span className="text-xs capitalize text-zinc-500">{risk.severity}</span>
            </div>
          ))}
        </div>
      )}

      {briefing.recommendedActions && briefing.recommendedActions.length > 0 && (
        <div className="mb-4 space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Recommended Actions</p>
          {briefing.recommendedActions.map((action) => (
            <button
              key={action.id}
              onClick={() => window.open(action.url, "_blank")}
              className="flex w-full items-center gap-2 rounded-lg bg-zinc-900/60 px-3 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800/60 hover:text-white"
            >
              <span className="flex-1">{action.label}</span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onMarkRead}
          className="flex-1 rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-amber-500"
        >
          {briefing.isRead ? "Read" : "Mark as Read"}
        </button>
        <button
          onClick={onViewAll}
          className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          View All
        </button>
      </div>
    </motion.div>
  );
}
