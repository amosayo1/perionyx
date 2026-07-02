import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth/auth';
import { requireTenantContext } from '@/server/context/tenant-context';
import { getLedgerForTransactionForTenant } from '@/modules/ledger';
import { ApprovalWorkflowEngine } from '@/modules/ledger/approval-workflow';
import { prisma } from '@/server/db/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { formatDateTime, formatMoney } from '@/lib/format';
import { decimalToString } from '@/server/http/money';
import TransactionWorkflowWrapper from '../TransactionWorkflowWrapper';
import { VersionHistoryPanel } from '@/components/enterprise/version-history-panel';

interface RouteProps {
  params: Promise<{ id: string }>;
}

export default async function TransactionDetailPage({ params }: RouteProps) {
  const { id: transactionId } = await params;
  const session = await auth();
  if (!session?.user?.activeCompanyId) {
    redirect('/onboarding');
  }

  const ctx = requireTenantContext(
    session.user.id,
    session.user.activeCompanyId,
    session.user.companyRole,
  );
  const { transaction, entries } = await getLedgerForTransactionForTenant(ctx, transactionId);
  const approvalRequirements = await ApprovalWorkflowEngine.getApprovalRequirements(transactionId, ctx.companyId);
  const approvalRecords = await prisma.transactionApproval.findMany({
    where: { transactionId },
    orderBy: { createdAt: 'asc' },
  });

  const pendingApprovals = approvalRecords.filter((record: { status: string }) => record.status === 'PENDING');
  const hasRequestPending = pendingApprovals.length > 0;
  const requiresApproval = approvalRequirements.requiredApprovals.length > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 text-perionyx-text-muted hover:text-perionyx-text-primary">
            <Link href="/transactions">← Transactions</Link>
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight text-perionyx-text-primary">Transaction {transaction.id}</h1>
          <p className="mt-1 text-sm text-perionyx-text-muted">Details and approval workflow for this posting.</p>
        </div>
        <Card className="w-full border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel sm:w-80 shadow-soft">
          <CardHeader className="pb-2">
            <CardDescription className="text-perionyx-text-muted">Status</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums text-perionyx-text-primary">
              <StatusBadge status={transaction.status} />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader>
            <CardTitle>Transaction summary</CardTitle>
            <CardDescription>Amount, transaction type, and ledger details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-perionyx-text-muted">Type</p>
                <p className="font-medium text-perionyx-text-primary">{transaction.type.replaceAll('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-perionyx-text-muted">Amount</p>
                <p className="font-medium text-perionyx-text-primary">{formatMoney(decimalToString(transaction.primaryAmount), transaction.currency)}</p>
              </div>
              <div>
                <p className="text-sm text-perionyx-text-muted">Currency</p>
                <p className="font-medium text-perionyx-text-primary">{transaction.currency}</p>
              </div>
              <div>
                <p className="text-sm text-perionyx-text-muted">Created</p>
                <p className="font-medium text-perionyx-text-primary">{formatDateTime(transaction.createdAt.toISOString())}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-perionyx-text-muted">Reference</p>
                <p className="font-medium text-perionyx-text-primary">{transaction.reference ?? '—'}</p>
              </div>
              <div>
                <p className="text-sm text-perionyx-text-muted">Idempotency key</p>
                <p className="font-medium text-perionyx-text-primary break-all">{transaction.idempotencyKey}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <TransactionWorkflowWrapper
            transaction={{
              id: transaction.id,
              status: transaction.status,
              type: transaction.type,
              createdAt: transaction.createdAt.toISOString(),
              primaryAmount: decimalToString(transaction.primaryAmount),
              currency: transaction.currency,
            }}
            approvalRecords={approvalRecords.map((r) => ({
              id: r.id,
              status: r.status,
              approvingUserId: r.approvingUserId,
              approvingUserRole: r.approvingUserRole,
              approvedAt: r.approvedAt?.toISOString() ?? null,
              rejectionReason: r.rejectionReason,
              level: r.level,
              sequenceNumber: r.sequenceNumber,
              createdAt: r.createdAt.toISOString(),
            }))}
            approvalRequirements={{
              requiredApprovals: approvalRequirements.requiredApprovals.map((r: { level: number; roleRequired: string }) => ({ role: r.roleRequired, level: r.level })),
              currentApprovals: approvalRequirements.currentApprovals.map((r: { approvingUserRole?: string | null; level: number }) => ({ role: r.approvingUserRole ?? "Unknown", level: r.level })),
              remainingApprovals: approvalRequirements.remainingApprovals.map(String),
              isApproved: approvalRequirements.isApproved,
              canBePosted: approvalRequirements.canBePosted,
            }}
            transactionId={transaction.id}
          />
        </div>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader>
          <CardTitle>Ledger postings</CardTitle>
          <CardDescription>Entries generated for this transaction.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.08)] text-left text-xs uppercase tracking-[0.2em] text-perionyx-text-muted">
                <th className="px-4 py-3">Wallet</th>
                <th className="px-4 py-3">Side</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-[rgba(255,255,255,0.05)]">
                  <td className="px-4 py-3 text-sm text-perionyx-text-primary">{entry.wallet?.name ?? entry.walletId}</td>
                  <td className="px-4 py-3 text-sm text-perionyx-text-muted">{entry.side}</td>
                  <td className="px-4 py-3 text-right font-semibold text-perionyx-text-primary">{formatMoney(decimalToString(entry.amount), entry.currency)}</td>
                  <td className="px-4 py-3 text-sm text-perionyx-text-muted">{formatDateTime(entry.createdAt.toISOString())}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {approvalRecords.length > 0 ? (
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardHeader>
            <CardTitle>Approval history</CardTitle>
            <CardDescription>Recorded approval requests and decisions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {approvalRecords.map((record) => (
              <div key={record.id} className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-perionyx-text-muted">
                  <span>Level: {record.level}</span>
                  <span>Status: {record.status}</span>
                </div>
                <div className="mt-2 text-sm text-perionyx-text-primary">
                  Approving role: {record.approvingUserRole ?? 'N/A'}
                </div>
                {record.approvedAt ? <div className="text-xs text-perionyx-text-muted">Approved at {formatDateTime(record.approvedAt.toISOString())}</div> : null}
                {record.rejectionReason ? <div className="text-xs text-perionyx-text-muted">Reason: {record.rejectionReason}</div> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="xl:hidden">
        <VersionHistoryPanel entityType="Transaction" entityId={transaction.id} />
      </div>
      <div className="hidden xl:block">
        <VersionHistoryPanel entityType="Transaction" entityId={transaction.id} />
      </div>
    </div>
  );
}
