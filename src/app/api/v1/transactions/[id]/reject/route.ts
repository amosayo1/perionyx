import { z } from 'zod';
import { NextResponse } from 'next/server';
import { ApprovalWorkflowEngine } from '@/modules/ledger/approval-workflow';
import { handleRouteError } from '@/server/http/handle-route';
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const RejectTransactionSchema = z.object({
  reason: z.string().max(2048).optional().default("rejected by approver"),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  return withRuntimeContext(request, async (ctx) => {
    const { params } = context;
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'approvals.reject');
      const transactionId = (await params).id;
      const rawBody = await request.json().catch(() => ({}));
      const parsed = RejectTransactionSchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json({ error: { code: "VALIDATION", message: parsed.error.issues[0].message } }, { status: 400 });
      }
      const { reason } = parsed.data;
      await ApprovalWorkflowEngine.rejectTransaction(transactionId, ctx.tenant.companyId, ctx.tenant.userId ?? '', ctx.tenant.role ?? '', reason);
      return NextResponse.json({ success: true });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}

