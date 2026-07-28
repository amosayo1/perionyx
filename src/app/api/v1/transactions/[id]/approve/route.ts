import { NextResponse } from 'next/server';
import { ApprovalWorkflowEngine } from '@/modules/ledger/approval-workflow';
import { handleRouteError } from '@/server/http/handle-route';
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  return withRuntimeContext(request, async (ctx) => {
    const { params } = context;
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'approvals.approve');
      const transactionId = (await params).id;
      const res = await ApprovalWorkflowEngine.approveTransaction(transactionId, ctx.tenant.companyId, ctx.tenant.userId ?? '', ctx.tenant.role ?? '');
      return NextResponse.json({ success: true, requirement: res });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}

