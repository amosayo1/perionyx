import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { requireTenantContext } from '@/server/context/tenant-context';
import { ApprovalPolicyService } from '@/modules/rbac/approval-policy.service';
import { handleRouteError } from '@/server/http/handle-route';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const rule = await ApprovalPolicyService.getRuleById(ctx.companyId, id);
    return NextResponse.json({ success: true, rule });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const body = await request.json();
    const rule = await ApprovalPolicyService.updateRule(ctx.companyId, ctx.userId, {
      id,
      name: body.name,
      description: body.description,
      priority: body.priority,
      scope: body.scope,
      scopeId: body.scopeId,
      minAmount: body.minAmount,
      maxAmount: body.maxAmount,
      applicableTransactionTypes: body.applicableTransactionTypes,
      applicableConnectorTypes: body.applicableConnectorTypes,
      requiredApprovalsCount: body.requiredApprovalsCount,
      sequentialApproval: body.sequentialApproval,
      dualApprovalRequired: body.dualApprovalRequired,
      escalationTimeoutHours: body.escalationTimeoutHours,
      autoEscalateAfterHours: body.autoEscalateAfterHours,
      requiresComplianceReview: body.requiresComplianceReview,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      conditions: body.conditions,
      approvalSteps: body.approvalSteps,
    });

    return NextResponse.json({ success: true, rule });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    await ApprovalPolicyService.deleteRule(ctx.companyId, ctx.userId, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
