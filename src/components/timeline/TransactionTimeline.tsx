"use client";

import { cn } from "@/lib/utils";
import { Check, Clock, X, ArrowRight, Loader2, Ban, RotateCcw } from "lucide-react";

interface TimelineState {
  label: string;
  description: string;
  icon: React.ReactNode;
  timestamp?: string;
  active: boolean;
  completed: boolean;
  failed: boolean;
}

interface Props {
  currentStatus: string;
  createdAt: string;
  completedAt?: string;
  approvalStatus?: string;
  reconciliationStatus?: string;
  deliveryStatus?: string;
}

export function TransactionTimeline({
  currentStatus,
  createdAt,
  completedAt,
  approvalStatus,
  reconciliationStatus,
  deliveryStatus,
}: Props) {
  const states: TimelineState[] = [
    {
      label: "Created",
      description: "Transaction record created",
      icon: <Clock className="h-4 w-4" />,
      timestamp: createdAt,
      active: true,
      completed: true,
      failed: false,
    },
    {
      label: "Validated",
      description: "Business rules and validation passed",
      icon: <Check className="h-4 w-4" />,
      active: ["PROCESSING", "COMPLETED", "FAILED"].includes(currentStatus),
      completed: ["COMPLETED"].includes(currentStatus),
      failed: false,
    },
    {
      label: "Approval Requested",
      description: approvalStatus === "REQUIRED" ? "Awaiting approval" : "No approval needed",
      icon: <ArrowRight className="h-4 w-4" />,
      active: approvalStatus === "PENDING" || approvalStatus === "REQUIRED",
      completed: approvalStatus === "APPROVED" || !approvalStatus,
      failed: approvalStatus === "REJECTED",
      timestamp: approvalStatus ? undefined : undefined,
    },
    {
      label: "Approved",
      description: "All required approvals obtained",
      icon: <Check className="h-4 w-4" />,
      active: approvalStatus === "APPROVED" || !approvalStatus,
      completed: approvalStatus === "APPROVED" || !approvalStatus,
      failed: false,
    },
    {
      label: "Posted",
      description: "Ledger entries recorded",
      icon: <Loader2 className="h-4 w-4" />,
      active: ["COMPLETED"].includes(currentStatus),
      completed: ["COMPLETED"].includes(currentStatus),
      failed: currentStatus === "FAILED",
      timestamp: completedAt,
    },
    {
      label: "Delivered",
      description: deliveryStatus === "DELIVERED" ? "External delivery confirmed" : deliveryStatus ?? "Pending delivery",
      icon: <ArrowRight className="h-4 w-4" />,
      active: deliveryStatus === "DELIVERED" || !deliveryStatus,
      completed: deliveryStatus === "DELIVERED" || !deliveryStatus,
      failed: deliveryStatus === "FAILED",
    },
    {
      label: "Reconciled",
      description: reconciliationStatus === "RECONCILED" ? "Reconciled with external records" : reconciliationStatus === "FAILED" ? "Reconciliation failed" : "Pending reconciliation",
      icon: <RotateCcw className="h-4 w-4" />,
      active: reconciliationStatus === "RECONCILED" || !reconciliationStatus,
      completed: reconciliationStatus === "RECONCILED" || !reconciliationStatus,
      failed: reconciliationStatus === "FAILED",
    },
  ];

  const activeIndex = states.findIndex((s) => !s.completed && !s.failed);
  const currentActiveIndex = activeIndex === -1 ? states.length - 1 : activeIndex;

  return (
    <div className="space-y-0">
      {states.map((state, i) => {
        const isPast = i < currentActiveIndex;
        const isCurrent = i === currentActiveIndex;
        const isFuture = i > currentActiveIndex;

        return (
          <div key={state.label} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Connector line */}
            {i < states.length - 1 && (
              <div
                className={cn(
                  "absolute left-[19px] top-10 h-full w-0.5",
                  isPast ? "bg-perionyx-gold" : "bg-[rgba(255,255,255,0.08)]",
                )}
              />
            )}

            {/* Icon circle */}
            <div
              className={cn(
                "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                state.failed && "border-red-500 bg-red-500/10 text-red-400",
                state.completed && !state.failed && "border-perionyx-gold bg-perionyx-gold/10 text-perionyx-gold",
                isCurrent && !state.completed && !state.failed && "border-perionyx-gold bg-perionyx-gold/20 text-perionyx-gold animate-pulse",
                isFuture && !state.failed && "border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] text-perionyx-text-subtle",
              )}
            >
              {state.failed ? <X className="h-4 w-4" /> : state.icon}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 pt-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-sm font-semibold",
                    state.failed && "text-red-400",
                    state.completed && !state.failed && "text-perionyx-gold",
                    isCurrent && !state.completed && !state.failed && "text-perionyx-text-primary",
                    isFuture && !state.failed && "text-perionyx-text-subtle",
                  )}
                >
                  {state.label}
                </span>
                {state.failed && (
                  <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-400">
                    Failed
                  </span>
                )}
                {isCurrent && !state.completed && !state.failed && (
                  <span className="rounded-full bg-perionyx-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-perionyx-gold">
                    Current
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "mt-0.5 text-xs",
                  state.failed && "text-red-500/70",
                  (state.completed || isCurrent) && !state.failed && "text-perionyx-text-muted",
                  isFuture && !state.failed && "text-perionyx-text-subtle",
                )}
              >
                {state.description}
              </p>
              {state.timestamp && (
                <p className="mt-0.5 text-[11px] text-perionyx-text-subtle">
                  {new Date(state.timestamp).toLocaleString()}
                </p>
              )}
            </div>

            {/* Status indicator */}
            <div className="flex shrink-0 items-center">
              {state.completed && !state.failed && (
                <span className="rounded-full bg-perionyx-gold/10 px-2 py-0.5 text-[10px] font-semibold text-perionyx-gold">
                  Done
                </span>
              )}
              {state.failed && (
                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                  Failed
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
