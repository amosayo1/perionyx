import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { requireTenantContext } from '@/server/context/tenant-context';
import { ApprovalWorkflowEngine } from '@/modules/ledger/approval-workflow';
import { handleRouteError } from '@/server/http/handle-route';
import { rbacService } from "@/modules/rbac/rbac.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { params } = context;
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole
    );

    const transactionId = (await params).id;

    // Approve this step
    const requirements = await ApprovalWorkflowEngine.approveTransaction(
      transactionId,
      ctx.companyId,
      session?.user?.id!,
      ctx.role
    );

    // If fully approved, execute the stored ledger lines
    let executionResult: { completed: boolean; error?: string } | undefined;
    if (requirements.canBePosted) {
      executionResult = await ApprovalWorkflowEngine.completeTransaction(
        transactionId,
        ctx.companyId,
      );
    }

    return NextResponse.json({
      success: true,
      requirements,
      execution: executionResult ?? null,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
