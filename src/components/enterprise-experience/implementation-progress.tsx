"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, expandCollapse } from "@/components/enterprise/motion/tokens";
import type { ImplementationSummary, ImplementationMilestoneData, ImplementationProgressData, MilestoneCategory, MilestoneStatus } from "@/modules/enterprise-experience/types";
import { CheckCircle2, ChevronDown, ChevronRight, Clock, Ban, AlertCircle, SkipForward } from "lucide-react";

const categoryColors: Record<MilestoneCategory, string> = {
  setup: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  integration: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  configuration: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
  validation: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  "go-live": "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
};

const statusDot: Record<MilestoneStatus, string> = {
  pending: "bg-zinc-500",
  in_progress: "bg-amber-400",
  completed: "bg-emerald-400",
  skipped: "bg-zinc-600",
  blocked: "bg-red-400",
};

const statusLabel: Record<MilestoneStatus, string> = {
  pending: "Pending", in_progress: "In Progress", completed: "Completed",
  skipped: "Skipped", blocked: "Blocked",
};

function CircularProgress({ percent }: { percent: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  const color = percent >= 75 ? "stroke-emerald-400" : percent >= 50 ? "stroke-amber-400" : "stroke-red-400";
  return (
    <div className="relative flex items-center justify-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <motion.circle
          cx="50" cy="50" r={r} fill="none"
          className={color}
          strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <span className="absolute text-2xl font-bold text-white">{Math.round(percent)}%</span>
    </div>
  );
}

interface MilestoneRowProps {
  milestone: ImplementationMilestoneData;
  progress: ImplementationProgressData | null;
  isRecommended: boolean;
  onUpdateStatus: (id: string, status: string) => void;
}

function MilestoneRow({ milestone, progress, isRecommended, onUpdateStatus }: MilestoneRowProps) {
  const [expanded, setExpanded] = useState(false);
  const status = progress?.status ?? "pending";

  return (
    <motion.div
      variants={fadeInUp}
      className={cn(
        "rounded-lg border bg-zinc-900/40 transition-colors",
        isRecommended ? "border-amber-500/40 bg-amber-500/5" : "border-white/[0.06]",
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className={cn("inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full", statusDot[status])} />
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-white">{milestone.name}</p>
          <p className="text-xs text-zinc-500">{statusLabel[status]}{status !== "pending" && progress?.completedAt ? ` · ${new Date(progress.completedAt).toLocaleDateString()}` : ""}</p>
        </div>
        <span className={cn("rounded-full px-2 py-0.5 text-xs", categoryColors[milestone.category])}>
          {milestone.category}
        </span>
        {isRecommended && (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
            Next
          </span>
        )}
        {expanded ? <ChevronDown className="h-4 w-4 text-zinc-500" /> : <ChevronRight className="h-4 w-4 text-zinc-500" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            variants={expandCollapse}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
          >
            <div className="border-t border-white/[0.06] px-4 py-3 space-y-2">
              {milestone.description && (
                <p className="text-sm text-zinc-400">{milestone.description}</p>
              )}
              {milestone.estimatedDays && (
                <p className="text-xs text-zinc-500">Estimated: {milestone.estimatedDays} days</p>
              )}
              {milestone.dependsOn && (
                <p className="text-xs text-zinc-500">Depends on: {milestone.dependsOn}</p>
              )}
              {progress?.notes && (
                <p className="text-xs text-zinc-400 italic">{progress.notes}</p>
              )}
              {progress?.completedBy && (
                <p className="text-xs text-zinc-500">Completed by: {progress.completedBy}</p>
              )}
              {(status === "pending" || status === "in_progress") && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onUpdateStatus(milestone.id, "completed")}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Complete
                  </button>
                  <button
                    onClick={() => onUpdateStatus(milestone.id, "skipped")}
                    className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-700"
                  >
                    <SkipForward className="h-3.5 w-3.5" />
                    Skip
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface ImplementationProgressProps {
  summary: ImplementationSummary;
  milestones: Array<{ milestone: ImplementationMilestoneData; progress: ImplementationProgressData | null }>;
  onUpdateStatus: (milestoneId: string, status: string) => void;
}

export function ImplementationProgress({ summary, milestones, onUpdateStatus }: ImplementationProgressProps) {
  const grouped = milestones.reduce<Record<string, typeof milestones>>((acc, m) => {
    const cat = m.milestone.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(m);
    return acc;
  }, {});

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5"
    >
      <div className="mb-6 flex items-start gap-6">
        <CircularProgress percent={summary.percentComplete} />
        <div className="flex-1 space-y-1">
          <h2 className="text-lg font-semibold text-white">Implementation Progress</h2>
          <p className="text-sm text-zinc-400">
            {summary.completed} of {summary.total} milestones completed
          </p>
          <p className="text-xs text-zinc-500">
            ~{summary.estimatedDaysRemaining} days remaining
            {summary.blocked > 0 && ` · ${summary.blocked} blocked`}
          </p>
          <div className="mt-2 flex gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> {summary.completed} done</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> {summary.inProgress} active</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" /> {summary.blocked} blocked</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-zinc-600" /> {summary.skipped} skipped</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {(Object.entries(grouped) as [MilestoneCategory, typeof milestones][]).map(([category, items]) => (
          <div key={category}>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {category.replace("-", " ")}
            </h3>
            <div className="space-y-1.5">
              {items.map(({ milestone, progress }) => (
                <MilestoneRow
                  key={milestone.id}
                  milestone={milestone}
                  progress={progress}
                  isRecommended={summary.nextRecommended === milestone.id}
                  onUpdateStatus={onUpdateStatus}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
