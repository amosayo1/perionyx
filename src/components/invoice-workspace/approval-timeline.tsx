"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ApprovalRecord } from "@/server/procurement/ap-repositories/types";

const DECISION_COLORS: Record<string, string> = {
  APPROVED: "bg-emerald-500/20 text-emerald-300",
  REJECTED: "bg-red-500/20 text-red-300",
  DELEGATED: "bg-blue-500/20 text-blue-300",
  SKIPPED: "bg-zinc-500/20 text-zinc-400",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-300",
  APPROVED: "bg-emerald-500/20 text-emerald-300",
  REJECTED: "bg-red-500/20 text-red-300",
  DELEGATED: "bg-blue-500/20 text-blue-300",
  SKIPPED: "bg-zinc-500/20 text-zinc-400",
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface ApprovalTimelineProps {
  approvals: ApprovalRecord[];
}

export function ApprovalTimeline({ approvals }: ApprovalTimelineProps) {
  if (approvals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approval Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">No approval records found for this invoice.</p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...approvals].sort((a, b) => a.approvalLevel - b.approvalLevel);
  const completed = sorted.filter((r) => r.status !== "PENDING").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Approval Timeline</CardTitle>
          <span className="text-xs text-zinc-500">
            {completed} of {sorted.length} steps completed
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {sorted.map((record, idx) => {
            const statusColor = STATUS_COLORS[record.status] ?? "bg-zinc-500/20 text-zinc-300";
            const decisionColor = record.decision ? (DECISION_COLORS[record.decision] ?? "bg-zinc-500/20 text-zinc-300") : "";
            const isLast = idx === sorted.length - 1;

            return (
              <div key={record.id} className="relative flex gap-4 pb-6 last:pb-0">
                {!isLast && (
                  <div className="absolute left-[7px] top-4 h-full w-px bg-white/[0.08]" />
                )}
                <div className={`mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                  record.status === "APPROVED" ? "border-emerald-500 bg-emerald-500/30" :
                  record.status === "REJECTED" ? "border-red-500 bg-red-500/30" :
                  record.status === "PENDING" ? "border-yellow-500 bg-yellow-500/20" :
                  "border-zinc-600 bg-zinc-800"
                }`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {record.approvalLevelName}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor}`}>
                      {record.status === "PENDING" ? "Pending" : record.status}
                    </span>
                    {record.decision && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${decisionColor}`}>
                        {record.decision}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-zinc-500">
                    {record.decisionBy && <span>by {record.decisionBy}</span>}
                    {record.decisionAt && <span>{formatDate(record.decisionAt)}</span>}
                    {record.requiredRole && <span>Role: {record.requiredRole.replace(/_/g, " ")}</span>}
                  </div>
                  {record.decisionComment && (
                    <p className="mt-1 text-sm text-zinc-400 italic">&ldquo;{record.decisionComment}&rdquo;</p>
                  )}
                  {record.delegatedTo && (
                    <p className="mt-0.5 text-xs text-blue-400">
                      Delegated to {record.delegatedTo}
                      {record.delegationReason && ` — ${record.delegationReason}`}
                    </p>
                  )}
                  {record.escalated && (
                    <p className="mt-0.5 text-xs text-orange-400">
                      Escalated{record.escalationReason && ` — ${record.escalationReason}`}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
