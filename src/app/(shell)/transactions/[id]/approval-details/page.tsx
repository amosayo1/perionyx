'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MatchedRule {
  ruleId: string;
  name: string;
  priority: number;
  requiredApprovalsCount: number;
  sequentialApproval: boolean;
  dualApprovalRequired: boolean;
  escalationTimeoutHours?: number;
  requiresComplianceReview: boolean;
  approvalSteps: Array<{
    stepNumber: number;
    roleRequired: string;
    approvalCount: number;
    timeoutHours?: number;
  }>;
}

interface ApprovalRequirement {
  rulesApplied: string[];
  requiredApprovals: Array<{ level: number; roleRequired: string }>;
  currentApprovals: Array<{
    id: string;
    status: string;
    approvingUserRole: string | null;
    approvingUserId: string | null;
    approvedAt: string | null;
    rejectionReason: string | null;
    sequenceNumber: number;
  }>;
  isApproved: boolean;
  canBePosted: boolean;
  remainingApprovals: number[];
}

interface TransactionDetails {
  transaction: {
    id: string;
    type: string;
    amount: string;
    currency: string;
    status: string;
    createdAt: string;
  };
  matchedRules: MatchedRule[];
  requirements: ApprovalRequirement;
}

export default function TransactionDetailPage() {
  const params = useParams();
  const transactionId = params.id as string;
  
  const [data, setData] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchTransactionDetails();
  }, [transactionId]);

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/transactions/${transactionId}/matching-rules`);
      if (res.ok) {
        const details = await res.json();
        setData(details);
      } else {
        setError('Failed to load transaction details');
      }
    } catch (err) {
      setError('Error fetching transaction details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!data) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/v1/transactions/${transactionId}/approvals/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        await fetchTransactionDetails();
      }
    } catch (err) {
      console.error('Failed to approve:', err);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!data || !rejectionReason.trim()) return;
    setRejecting(true);
    try {
      const res = await fetch(`/api/v1/transactions/${transactionId}/approvals/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      if (res.ok) {
        setRejectionReason('');
        await fetchTransactionDetails();
      }
    } catch (err) {
      console.error('Failed to reject:', err);
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 py-8">
        <p className="text-perionyx-text-muted">Loading transaction details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 py-8">
        <p role="alert" className="text-red-400">{error || 'Failed to load transaction'}</p>
      </div>
    );
  }

  const { transaction, matchedRules, requirements } = data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-500/20 text-green-300';
      case 'REJECTED':
        return 'bg-red-500/20 text-red-300';
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'ESCALATED':
        return 'bg-purple-500/20 text-purple-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-perionyx-text-primary">
          Transaction Details
        </h1>
        <p className="mt-2 text-sm text-perionyx-text-muted">
          ID: {transaction.id}
        </p>
      </div>

      {/* Transaction Summary */}
      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader>
          <CardTitle>Transaction Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-perionyx-text-muted">Type</p>
              <p className="mt-1 text-perionyx-text-primary">{transaction.type}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-perionyx-text-muted">Amount</p>
              <p className="mt-1 text-perionyx-text-primary">
                {transaction.currency} {parseFloat(transaction.amount).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-perionyx-text-muted">Status</p>
              <p className="mt-1">
                <Badge className={getStatusColor(transaction.status)}>
                  {transaction.status}
                </Badge>
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-perionyx-text-muted">Created</p>
              <p className="mt-1 text-perionyx-text-primary">
                {new Date(transaction.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matching Rules */}
      {matchedRules.length > 0 && (
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader>
            <CardTitle>Applicable Approval Rules ({matchedRules.length})</CardTitle>
            <CardDescription>Rules that apply to this transaction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {matchedRules.map((rule) => (
              <div
                key={rule.ruleId}
                className="rounded-lg border border-[rgba(212,175,55,0.12)] bg-[rgba(212,175,55,0.05)] p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-perionyx-text-primary">{rule.name}</p>
                    <p className="text-xs text-perionyx-text-muted mt-1">Priority: #{rule.priority}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-[rgba(212,175,55,0.2)] text-perionyx-gold">
                    Matched
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                  <div>
                    <p className="uppercase tracking-wider text-perionyx-text-muted">Approvals Required</p>
                    <p className="mt-1 text-perionyx-text-primary">{rule.requiredApprovalsCount}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wider text-perionyx-text-muted">Approval Type</p>
                    <p className="mt-1 text-perionyx-text-primary">
                      {rule.sequentialApproval ? 'Sequential' : 'Parallel'}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wider text-perionyx-text-muted">Requirements</p>
                    <div className="mt-1 flex gap-1 flex-wrap">
                      {rule.dualApprovalRequired && (
                        <span className="text-xs px-1 py-0.5 rounded bg-[rgba(147,51,234,0.2)] text-purple-300">
                          Dual
                        </span>
                      )}
                      {rule.requiresComplianceReview && (
                        <span className="text-xs px-1 py-0.5 rounded bg-[rgba(34,197,94,0.2)] text-green-300">
                          Compliance
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-[rgba(212,175,55,0.1)] pt-3">
                  <p className="text-xs uppercase tracking-wider text-perionyx-text-muted mb-2">Approval Chain</p>
                  <div className="space-y-1">
                    {rule.approvalSteps.map((step) => (
                      <div key={step.stepNumber} className="text-xs text-perionyx-text-primary">
                        Step {step.stepNumber}: <span className="text-perionyx-gold">{step.roleRequired}</span> ({step.approvalCount}x)
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Approval Status */}
      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Approval Status</CardTitle>
              <CardDescription>Current approval state and requirements</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-perionyx-text-muted">Overall Status</p>
              <Badge
                className={`mt-1 ${
                  requirements.isApproved
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-yellow-500/20 text-yellow-300'
                }`}
              >
                {requirements.isApproved ? 'APPROVED' : 'PENDING APPROVAL'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Required Approvals */}
          <div>
            <p className="text-sm font-medium text-perionyx-text-primary mb-3">Required Approvals</p>
            {requirements.requiredApprovals.length === 0 ? (
              <p className="text-xs text-perionyx-text-muted">No approvals required for this transaction</p>
            ) : (
              <div className="space-y-2">
                {requirements.requiredApprovals.map((req, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.03)] px-3 py-2"
                  >
                    <span className="text-sm text-perionyx-text-primary">{req.roleRequired}</span>
                    <Badge className="bg-[rgba(212,175,55,0.2)] text-perionyx-gold">
                      Level {req.level}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current Approvals */}
          {requirements.currentApprovals.length > 0 && (
            <div>
              <p className="text-sm font-medium text-perionyx-text-primary mb-3">Approval History</p>
              <div className="space-y-2">
                {requirements.currentApprovals.map((approval) => (
                  <div
                    key={approval.id}
                    className="rounded-lg border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.03)] p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-perionyx-text-primary">
                          {approval.approvingUserRole || 'Pending'}
                        </p>
                        <p className="text-xs text-perionyx-text-muted mt-1">
                          {approval.approvedAt
                            ? `Approved on ${new Date(approval.approvedAt).toLocaleDateString()}`
                            : 'Awaiting approval'}
                        </p>
                        {approval.rejectionReason && (
                          <p className="text-xs text-red-300 mt-1">Rejected: {approval.rejectionReason}</p>
                        )}
                      </div>
                      <Badge className={getStatusColor(approval.status)}>
                        {approval.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approval Actions */}
          {!requirements.isApproved && requirements.currentApprovals.length > 0 && (
            <div className="border-t border-[rgba(212,175,55,0.1)] pt-4">
              <p className="text-sm font-medium text-perionyx-text-primary mb-3">Approval Actions</p>
              <div className="space-y-3">
                <Button onClick={handleApprove} disabled={approving} variant="default" size="sm">
                  {approving ? 'Approving...' : 'Approve Transaction'}
                </Button>

                <div>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Rejection reason (optional for approval)"
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-perionyx-text-primary placeholder-perionyx-text-muted"
                    rows={2}
                  />
                  <Button
                    onClick={handleReject}
                    disabled={rejecting}
                    variant="outline"
                    size="sm"
                    className="mt-2 text-red-400"
                  >
                    {rejecting ? 'Rejecting...' : 'Reject Transaction'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
