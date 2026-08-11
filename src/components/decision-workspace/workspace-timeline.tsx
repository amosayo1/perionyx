"use client";

/**
 * Phase 22.3 — Decision Workspace: Center zone — Decision Timeline
 *
 * Append-only, chronological record of who did what when and why, merged from
 * the AP audit trail + approval chain + status transitions (06 §9, F-39).
 * Every entry names an actor, a timestamp, and an outcome.
 */

import { cn } from "@/lib/utils";
import {
  FilePlus,
  RefreshCw,
  PenLine,
  CheckCircle2,
  XCircle,
  UserPlus,
  ArrowUpCircle,
  AlertTriangle,
  CheckCheck,
  CreditCard,
  Ban,
  type LucideIcon,
} from "lucide-react";
import type { DecisionWorkspaceData, TimelineAction } from "@/modules/decision-workspace/types";
import { formatDateTime } from "@/modules/decision-workspace/format";

const ACTION_META: Record<TimelineAction, { icon: LucideIcon; color: string; label: string }> = {
  CREATED: { icon: FilePlus, color: "text-zinc-400", label: "Created" },
  STATUS_CHANGED: { icon: RefreshCw, color: "text-blue-400", label: "Status changed" },
  UPDATED: { icon: PenLine, color: "text-zinc-400", label: "Updated" },
  APPROVED: { icon: CheckCircle2, color: "text-emerald-400", label: "Approved" },
  REJECTED: { icon: XCircle, color: "text-red-400", label: "Rejected" },
  DELEGATED: { icon: UserPlus, color: "text-amber-400", label: "Delegated" },
  ESCALATED: { icon: ArrowUpCircle, color: "text-orange-400", label: "Escalated" },
  EXCEPTION: { icon: AlertTriangle, color: "text-amber-400", label: "Exception" },
  RESOLVED: { icon: CheckCheck, color: "text-emerald-400", label: "Resolved" },
  PAID: { icon: CreditCard, color: "text-blue-400", label: "Paid" },
  VOIDED: { icon: Ban, color: "text-red-400", label: "Voided" },
};

export function WorkspaceTimeline({ data }: { data: DecisionWorkspaceData }) {
  return (
    <section
      id="workspace-timeline"
      className="scroll-mt-24 rounded-xl border border-white/[0.06] bg-gradient-to-b from-surface-raised/70 to-surface-base/50"
    >
      <header className="flex items-baseline justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Decision timeline</h2>
        <p className="text-[11px] text-zinc-500">Append-only · every entry has an actor and a timestamp</p>
      </header>

      <ol className="px-4 py-3">
        {data.timeline.length === 0 ? (
          <li className="text-[13px] text-zinc-500">No recorded events for this invoice.</li>
        ) : (
          data.timeline.map((entry, i) => {
            const meta = ACTION_META[entry.action];
            const Icon = meta.icon;
            const isLast = i === data.timeline.length - 1;
            return (
              <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
                {!isLast && <span className="absolute left-[9px] top-5 h-full w-px bg-white/[0.07]" aria-hidden />}
                <span className={cn("relative mt-0.5 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-surface-elevated", meta.color)}>
                  <Icon className="h-3 w-3" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-[13px] font-medium text-zinc-200">{meta.label}</span>
                    <span className="text-[10px] text-zinc-600">{formatDateTime(entry.at)}</span>
                    {entry.outcome && (
                      <span className="rounded border border-white/[0.06] bg-white/[0.03] px-1.5 py-px text-[9px] font-medium uppercase tracking-[0.08em] text-zinc-500">
                        {entry.outcome.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-zinc-400">{entry.detail}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-600">
                    <span className="font-mono text-zinc-500">{entry.actor}</span>
                    {entry.actorRole ? ` · ${entry.actorRole}` : ""}
                  </p>
                </div>
              </li>
            );
          })
        )}
      </ol>
    </section>
  );
}
