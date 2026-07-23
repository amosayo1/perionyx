"use client";

import { cn } from "@/lib/utils";
import {
  CheckCircle2, XCircle, AlertTriangle, Clock, History, Shield,
} from "lucide-react";
import { MOCK_APPROVALS } from "./data";
import type { ApprovalRequest } from "./types";

interface PaymentApprovalQueueProps {
  className?: string;
}

const STATUS_STYLES: Record<ApprovalRequest["status"], string> = {
  pending: "bg-blue-500/10 text-blue-400",
  approved: "bg-green-500/10 text-green-400",
  rejected: "bg-red-500/10 text-red-400",
  escalated: "bg-amber-500/10 text-amber-400",
  changes_requested: "bg-amber-500/10 text-amber-400",
};

const RISK_STYLES: Record<ApprovalRequest["risk"], string> = {
  low: "bg-emerald-500/10 text-emerald-400",
  medium: "bg-amber-500/10 text-amber-400",
  high: "bg-red-500/10 text-red-400",
};

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function PaymentApprovalQueue({ className }: PaymentApprovalQueueProps) {
  const sorted = [...MOCK_APPROVALS].sort((a, b) => {
    const order: Record<ApprovalRequest["status"], number> = {
      pending: 0, escalated: 1, changes_requested: 2, approved: 3, rejected: 4,
    };
    return (order[a.status] ?? 5) - (order[b.status] ?? 5);
  });

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div>
          <h3 className="text-sm font-medium text-white">Payment Approval Queue</h3>
          <p className="text-[12px] text-zinc-500">
            {MOCK_APPROVALS.filter((a) => a.status === "pending").length} pending · {MOCK_APPROVALS.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-3 py-1.5 text-[12px] font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
            aria-label="Approve selected"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approve
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md bg-red-500/10 px-3 py-1.5 text-[12px] font-medium text-red-400 transition-colors hover:bg-red-500/20"
            aria-label="Reject selected"
          >
            <XCircle className="h-3.5 w-3.5" />
            Reject
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md bg-amber-500/10 px-3 py-1.5 text-[12px] font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
            aria-label="Request changes"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Changes
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-white/[0.06] px-3 py-1.5 text-[12px] font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            aria-label="View audit log"
          >
            <History className="h-3.5 w-3.5" />
            View Audit
          </button>
        </div>
      </div>

      <div className="divide-y divide-white/[0.06]">
        {sorted.map((approval) => {
          const isUrgent = approval.status === "pending" && approval.slaRemainingMinutes < 30;

          return (
            <div
              key={approval.id}
              className={cn(
                "px-5 py-4 transition-colors hover:bg-zinc-800/30",
                isUrgent && "border-l-2 border-l-red-500",
              )}
              role="article"
              aria-label={`Approval request ${approval.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-white">{approval.id}</span>
                    <span className="text-[13px] text-zinc-400">·</span>
                    <span className="text-[13px] text-zinc-300">{approval.paymentReference}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS_STYLES[approval.status])}>
                      {approval.status.replace(/_/g, " ")}
                    </span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", RISK_STYLES[approval.risk])}>
                      {approval.risk}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
                    <span className="text-zinc-400">{approval.entity}</span>
                    <span className="text-zinc-600">→</span>
                    <span className="text-zinc-300">{approval.counterparty}</span>
                    <span className="text-zinc-500">·</span>
                    <span className="font-medium text-white">{formatCurrency(approval.amount)}</span>
                    <span className="text-zinc-400">{approval.currency}</span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-400">{approval.paymentType}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
                    <span className="flex items-center gap-1 text-zinc-500">
                      <Shield className="h-3 w-3" />
                      {approval.approvalLevel} of {approval.approvalChain.length}
                    </span>
                    <span className="text-zinc-500">Approver: <span className="text-zinc-300">{approval.approver}</span></span>
                    <span className="text-zinc-500">Requested by: <span className="text-zinc-300">{approval.requestedBy}</span></span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
                    <span className="text-zinc-500">{approval.policy}</span>
                    {approval.status === "pending" && (
                      <span className={cn(
                        "flex items-center gap-1",
                        isUrgent ? "text-red-400 font-medium" : "text-zinc-500",
                      )}>
                        <Clock className="h-3 w-3" />
                        SLA {formatTime(approval.slaRemainingMinutes)} remaining
                        {isUrgent && <span className="text-red-400"> · Urgent</span>}
                      </span>
                    )}
                  </div>

                  {approval.notes && (
                    <p className="text-[12px] text-amber-400/80 italic">{approval.notes}</p>
                  )}
                </div>

                {approval.status === "pending" && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      className="rounded-md bg-emerald-500/10 px-3 py-1.5 text-[12px] font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
                      aria-label={`Approve ${approval.id}`}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="rounded-md bg-red-500/10 px-3 py-1.5 text-[12px] font-medium text-red-400 transition-colors hover:bg-red-500/20"
                      aria-label={`Reject ${approval.id}`}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      className="rounded-md bg-amber-500/10 px-3 py-1.5 text-[12px] font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
                      aria-label={`Request changes for ${approval.id}`}
                    >
                      Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
