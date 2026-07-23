import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { requireTenantContext } from '@/server/context/tenant-context';
import { ApprovalWorkflowEngine } from '@/modules/ledger/approval-workflow';
import { handleRouteError } from '@/server/http/handle-route';
import { rbacService } from "@/modules/rbac/rbac.service";

/**
 * POST /api/v1/transactions/[id]/approvals/reject
 * 
 * Reject a pending transaction approval.
 */
export async function POST(request: Request, context: any) {
  const { params } = context;
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole
    );

    const transactionId = (await params).id;
    const { reason } = await request.json();

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json(
        { error: 'Rejection reason required' },
        { status: 400 }
      );
    }

    // Reject the transaction
    await ApprovalWorkflowEngine.rejectTransaction(
      transactionId,
      ctx.companyId,
      session?.user?.id!,
      ctx.role,
      reason
    );

    return NextResponse.json({
      success: true,
      message: 'Transaction rejected',
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
