import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { requireTenantContext } from '@/server/context/tenant-context';
import { RuleEvaluationEngine } from '@/modules/rbac/rule-evaluation.engine';
import { ApprovalWorkflowEngine } from '@/modules/ledger/approval-workflow';
import { handleRouteError } from '@/server/http/handle-route';
import { prisma } from '@/server/db/prisma';
import { rbacService } from "@/modules/rbac/rbac.service";

/**
 * GET /api/v1/transactions/[id]/matching-rules
 * 
 * Returns which approval rules apply to a specific transaction,
 * what approval steps are required, and current approval status.
 */
export async function GET(request: Request, context: any) {
  const { params } = context;
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole
    );

    const transactionId = (await params).id;

    // Fetch transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        approvals: {
          orderBy: { sequenceNumber: 'asc' },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (transaction.companyId !== ctx.companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get matching rules
    const matchedRules = await RuleEvaluationEngine.evaluateTransaction({
      companyId: ctx.companyId,
      amount: transaction.primaryAmount,
      transactionType: transaction.type,
      metadata: transaction.metadata as Record<string, any>,
    });

    // Get approval requirements
    const requirements = await ApprovalWorkflowEngine.getApprovalRequirements(
      transactionId,
      ctx.companyId
    );

    // Build response
    return NextResponse.json({
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.primaryAmount.toString(),
        currency: transaction.currency,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
      matchedRules,
      requirements: {
        rulesApplied: requirements.rulesApplied,
        requiredApprovals: requirements.requiredApprovals,
        currentApprovals: requirements.currentApprovals.map((a) => ({
          id: a.id,
          status: a.status,
          approvingUserRole: a.approvingUserRole,
          approvingUserId: a.approvingUserId,
          approvedAt: a.approvedAt,
          rejectionReason: a.rejectionReason,
          sequenceNumber: a.sequenceNumber,
        })),
        isApproved: requirements.isApproved,
        canBePosted: requirements.canBePosted,
        remainingApprovals: requirements.remainingApprovals,
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
