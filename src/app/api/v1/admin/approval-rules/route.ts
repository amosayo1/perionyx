import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { requireTenantContext } from '@/server/context/tenant-context';
import { ApprovalPolicyService } from '@/modules/rbac/approval-policy.service';
import { handleRouteError } from '@/server/http/handle-route';
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'approvals.configure');

    const rules = await ApprovalPolicyService.getRulesForCompany(ctx.companyId);
    return NextResponse.json({ success: true, rules });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const body = await request.json();
    const rule = await ApprovalPolicyService.createRule(ctx.companyId, ctx.userId, {
      name: body.name,
      description: body.description,
      priority: body.priority ?? 100,
      scope: body.scope ?? 'GLOBAL',
      scopeId: body.scopeId,
      minAmount: body.minAmount ?? 0,
      maxAmount: body.maxAmount,
      applicableTransactionTypes: body.applicableTransactionTypes || [],
      applicableConnectorTypes: body.applicableConnectorTypes,
      requiredApprovalsCount: body.requiredApprovalsCount ?? 1,
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
