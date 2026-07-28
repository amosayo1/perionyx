import { NextRequest, NextResponse } from 'next/server';
import { ApprovalPolicyService } from '@/modules/rbac/approval-policy.service';
import { handleRouteError } from '@/server/http/handle-route';
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { id } = await context.params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'audit.read');
  
      const history = await ApprovalPolicyService.getRuleAuditHistory(ctx.tenant.companyId, id);
      return NextResponse.json({ success: true, history });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}
