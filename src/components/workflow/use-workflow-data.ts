"use client";

import { useMemo } from "react";
import type { WorkflowData, WorkflowStage, WorkflowEvent, WorkflowStatus } from "./types";

interface RawApproval {
  id: string;
  status: string;
  approvingUserId: string | null;
  approvingUserRole: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  level: number;
  sequenceNumber: number;
  createdAt: string;
}

interface RawTransaction {
  id: string;
  status: string;
  type: string;
  createdAt: string;
  updatedAt?: string;
  primaryAmount?: string;
  currency?: string;
  approvalStatus?: string;
  reconciliationStatus?: string;
  deliveryStatus?: string;
}

interface RawRequirement {
  requiredApprovals: { role: string; level: number }[];
  currentApprovals: { role: string; level: number }[];
  remainingApprovals: string[];
  isApproved: boolean;
  canBePosted: boolean;
}

function elapsed(isoStart: string, isoEnd?: string): string {
  const start = new Date(isoStart).getTime();
  const end = isoEnd ? new Date(isoEnd).getTime() : Date.now();
  const diff = Math.max(0, end - start);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 48) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function useWorkflowData(
  transaction: RawTransaction | null,
  requirements: RawRequirement | null,
  approvals: RawApproval[],
): WorkflowData | null {
  return useMemo(() => {
    if (!transaction) return null;

    const tx = transaction;
    const req = requirements;
    const allApprovals = approvals ?? [];

    // Build stages based on transaction status and approvals
    const stages: WorkflowStage[] = [];
    const events: WorkflowEvent[] = [];

    // Stage 1: Created
    stages.push({
      id: "created",
      label: "Created",
      description: `${tx.type} transaction initiated`,
      status: "completed",
      completedAt: tx.createdAt,
    });
    events.push({
      id: "evt-created",
      type: "created",
      label: "Transaction Created",
      description: `${tx.type} transaction created`,
      timestamp: tx.createdAt,
    });

    // Stage 2: Validation
    const isValidated = tx.status !== "CREATED" && tx.status !== "FAILED_VALIDATION";
    stages.push({
      id: "validated",
      label: "Validated",
      description: "Policy and compliance checks",
      status: tx.status === "FAILED_VALIDATION" ? "failed" : "completed",
      completedAt: tx.createdAt,
    });

    // Stage 3: Approval
    const hasApprovals = allApprovals.length > 0;
    const isApproved = (req?.isApproved ?? false) || tx.status === "APPROVED" || tx.status === "COMPLETED";
    const isRejected = allApprovals.some((a) => a.status === "REJECTED");
    const isPendingApproval = tx.status === "PENDING_APPROVAL" || (hasApprovals && !isApproved && !isRejected);
    const isEscalated = allApprovals.some((a) => a.status === "ESCALATED");

    let approvalStatus: WorkflowStage["status"] = "pending";
    if (isApproved) approvalStatus = "completed";
    else if (isRejected) approvalStatus = "failed";
    else if (isPendingApproval || isEscalated) approvalStatus = "active";

    const pendingOwner = allApprovals.find((a) => a.status === "PENDING")?.approvingUserRole ?? "Pending";

    stages.push({
      id: "approval",
      label: "Approvals",
      description: isEscalated ? "Escalated — urgent attention needed" : `${allApprovals.filter((a) => a.status === "APPROVED").length}/${allApprovals.length || req?.requiredApprovals?.length || 1} approved`,
      status: approvalStatus,
      owner: approvalStatus === "active" ? pendingOwner : undefined,
      completedAt: allApprovals.find((a) => a.status === "APPROVED")?.approvedAt ?? undefined,
    });

    // Approval events
    for (const a of allApprovals) {
      events.push({
        id: `evt-approval-${a.id}`,
        type: a.status === "APPROVED" ? "approved" : a.status === "REJECTED" ? "rejected" : a.status === "ESCALATED" ? "escalated" : "pending",
        label: a.status === "APPROVED" ? "Approved" : a.status === "REJECTED" ? "Rejected" : a.status === "ESCALATED" ? "Escalated" : "Approval Pending",
        description: a.approvingUserRole ? `by ${a.approvingUserRole}` : a.rejectionReason ? `Reason: ${a.rejectionReason}` : undefined,
        actor: a.approvingUserId ?? undefined,
        timestamp: a.approvedAt ?? a.createdAt,
      });
    }

    // Stage 4: Treasury Execution
    const isCompleted = tx.status === "COMPLETED" || tx.status === "POSTED";
    const isFailed = tx.status === "FAILED";
    const isExecuting = tx.status === "POSTING" || (isApproved && !isCompleted && !isFailed);

    stages.push({
      id: "execution",
      label: "Treasury",
      description: "Ledger posting and settlement",
      status: isCompleted ? "completed" : isFailed ? "failed" : isExecuting ? "active" : "pending",
    });

    // Stage 5: Posted
    stages.push({
      id: "posted",
      label: "Posted",
      description: "Ledger entries recorded",
      status: isCompleted ? "completed" : "pending",
    });

    // Stage 6: Reconciled (if applicable)
    const isReconciled = tx.reconciliationStatus === "RECONCILED" || tx.status === "RECONCILED";
    stages.push({
      id: "reconciled",
      label: "Reconciled",
      description: "Matched with external statements",
      status: isReconciled ? "completed" : isCompleted ? "pending" : "pending",
    });

    // Compute workflow status
    const waitingSince = allApprovals.find((a) => a.status === "PENDING")?.createdAt ?? tx.createdAt;
    const slaMs = 24 * 3600000; // 24h SLA
    const elapsedMs = Date.now() - new Date(waitingSince).getTime();
    const remainingMs = slaMs - elapsedMs;
    const isBottleneck = elapsedMs > 12 * 3600000; // >12h = bottleneck
    const amount = Number(tx.primaryAmount ?? 0);

    // Risk: high amount or escalated
    let riskLevel: WorkflowStatus["riskLevel"] = "low";
    if (isEscalated || amount > 1000000) riskLevel = "critical";
    else if (elapsedMs > 18 * 3600000 || amount > 100000) riskLevel = "high";
    else if (elapsedMs > 8 * 3600000 || amount > 10000) riskLevel = "medium";

    const status: WorkflowStatus = {
      currentOwner: isPendingApproval ? pendingOwner : isCompleted ? "System" : "—",
      waitingSince,
      slaDeadline: new Date(new Date(waitingSince).getTime() + slaMs).toISOString(),
      riskLevel,
      bottleneck: isBottleneck,
      bottleneckReason: isBottleneck ? `Pending longer than 12 hours` : undefined,
      totalElapsed: elapsed(waitingSince),
      slaRemaining: remainingMs > 0 ? elapsed(new Date().toISOString(), new Date(Date.now() + remainingMs).toISOString()) : "Overdue",
    };

    return {
      stages,
      events,
      status,
      transactionId: tx.id,
      transactionStatus: tx.status,
      canEscalate: isPendingApproval && !isEscalated,
      canPause: false, // Pause not supported by API
      isPaused: false,
    };
  }, [transaction, requirements, approvals]);
}
