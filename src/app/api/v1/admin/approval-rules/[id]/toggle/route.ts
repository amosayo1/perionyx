import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { requireTenantContext } from '@/server/context/tenant-context';
import { ApprovalPolicyService } from '@/modules/rbac/approval-policy.service';
import { handleRouteError } from '@/server/http/handle-route';
import { rbacService } from "@/modules/rbac/rbac.service";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'approvals.configure');

    const body = await request.json();
    const { enabled } = body;

    const rule = await ApprovalPolicyService.toggleRuleStatus(
      ctx.companyId,
      ctx.userId,
      id,
      enabled
    );

    return NextResponse.json({ success: true, rule });
  } catch (err) {
    return handleRouteError(err);
  }
}
