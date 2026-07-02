'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApprovalStatusBadge, ApprovalTimeline, EscalationWarning, ApprovalChainBadge, ApprovalIndicator } from '@/components/approval';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export interface ApprovalDetailsPanelProps {
  transactionId: string;
  transactionType: string;
  transactionAmount: string;
  transactionCurrency: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'escalated';
  pendingApprovalsCount: number;
  totalApprovalsRequired: number;
  hoursElapsed: number;
  timeoutHours: number;
  isEscalated: boolean;
  escalatedReason?: string;
  approvalTimeline: Array<{
    id: string;
    type: 'requested' | 'approved' | 'rejected' | 'escalated';
    actor: string;
    actorRole?: string;
    timestamp: string;
    message?: string;
    reason?: string;
  }>;
  approvalChain: Array<{
    stepNumber: number;
    roleRequired: string;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedAt?: string;
  }>;
}

export function ApprovalDetailsPanel({
  transactionId,
  transactionType,
  transactionAmount,
  transactionCurrency,
  approvalStatus,
  pendingApprovalsCount,
  totalApprovalsRequired,
  hoursElapsed,
  timeoutHours,
  isEscalated,
  escalatedReason,
  approvalTimeline,
  approvalChain,
}: ApprovalDetailsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Header with status */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-perionyx-text-primary">Approval Status</h2>
            <p className="text-sm text-perionyx-text-muted mt-1">Transaction ID: {transactionId}</p>
          </div>
          <ApprovalStatusBadge status={approvalStatus} size="lg" />
        </div>

        {/* Transaction summary */}
        <div className="grid grid-cols-3 gap-4 p-4 rounded-lg border border-[rgba(212,175,55,0.12)] bg-[rgba(212,175,55,0.04)]">
          <div>
            <div className="text-xs uppercase tracking-wide text-perionyx-text-muted">Type</div>
            <div className="text-sm font-semibold text-perionyx-text-primary mt-1">{transactionType}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-perionyx-text-muted">Amount</div>
            <div className="text-sm font-semibold text-perionyx-text-primary mt-1">
              {transactionCurrency} {parseFloat(transactionAmount).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-perionyx-text-muted">Approval Progress</div>
            <div className="text-sm font-semibold text-perionyx-text-primary mt-1">
              {totalApprovalsRequired - pendingApprovalsCount} / {totalApprovalsRequired}
            </div>
          </div>
        </div>
      </div>

      {/* Escalation warning if needed */}
      {(isEscalated || hoursElapsed > timeoutHours * 0.75) && (
        <EscalationWarning
          isEscalated={isEscalated}
          hoursElapsed={hoursElapsed}
          timeoutHours={timeoutHours}
          escalatedReason={escalatedReason}
        />
      )}

      {/* Approval progress indicator */}
      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle>Approval Progress</CardTitle>
          <CardDescription>Track the approval workflow progression</CardDescription>
        </CardHeader>
        <CardContent>
          <ApprovalIndicator
            pendingCount={pendingApprovalsCount}
            requiredCount={totalApprovalsRequired}
            isEscalated={isEscalated}
            hoursElapsed={hoursElapsed}
            timeoutHours={timeoutHours}
          />
        </CardContent>
      </Card>

      {/* Approval chain */}
      {approvalChain.length > 0 && (
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle>Approval Chain</CardTitle>
            <CardDescription>Required approval steps and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <ApprovalChainBadge steps={approvalChain} />
          </CardContent>
        </Card>
      )}

      {/* Approval timeline */}
      {approvalTimeline.length > 0 && (
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle>Approval Timeline</CardTitle>
            <CardDescription>Complete audit trail of approval actions</CardDescription>
          </CardHeader>
          <CardContent>
            <ApprovalTimeline events={approvalTimeline} />
          </CardContent>
        </Card>
      )}

      {/* Approval completion indicator */}
      {approvalStatus === 'approved' && (
        <div className="p-4 rounded-lg border border-[rgba(46,125,94,0.2)] bg-[rgba(46,125,94,0.08)] flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold text-perionyx-text-primary">All Approvals Received</div>
            <div className="text-xs text-perionyx-text-muted mt-1">
              This transaction has received all required approvals and is ready for posting.
            </div>
          </div>
        </div>
      )}

      {/* Rejection indicator */}
      {approvalStatus === 'rejected' && (
        <div className="p-4 rounded-lg border border-[rgba(139,0,0,0.2)] bg-[rgba(139,0,0,0.08)] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold text-perionyx-text-primary">Approval Rejected</div>
            <div className="text-xs text-perionyx-text-muted mt-1">
              An approver has rejected this transaction. Review the timeline for rejection details.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
