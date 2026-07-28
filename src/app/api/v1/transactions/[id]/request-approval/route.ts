import { NextResponse } from 'next/server';
import { ApprovalWorkflowEngine } from '@/modules/ledger/approval-workflow';
import { handleRouteError } from '@/server/http/handle-route';
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(request: Request, context: any) {
  return withRuntimeContext(request, async (ctx) => {
    const { params } = context;
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'approvals.approve');
      const transactionId = (await params).id;
      
      // Get the approval requirements for this transaction
      const requirements = await ApprovalWorkflowEngine.getApprovalRequirements(transactionId, ctx.tenant.companyId);
      
      return NextResponse.json({ requirements });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}
