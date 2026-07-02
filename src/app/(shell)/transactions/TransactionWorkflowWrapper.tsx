"use client";

import { WorkflowPanel } from "@/components/workflow";
import { ApprovalThread } from "@/components/approval-thread";

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

interface Props {
  transaction: RawTransaction;
  approvalRecords: RawApproval[];
  approvalRequirements: RawRequirement | null;
  transactionId: string;
}

export default function TransactionWorkflowWrapper({
  transaction,
  approvalRecords,
  approvalRequirements,
  transactionId,
}: Props) {
  return (
    <WorkflowPanel
      transaction={transaction}
      approvalRecords={approvalRecords}
      approvalRequirements={approvalRequirements}
      threadComponent={<ApprovalThread transactionId={transactionId} />}
    />
  );
}
