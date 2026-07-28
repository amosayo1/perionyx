import { z } from 'zod';
import { NextResponse } from 'next/server';
import { ApprovalWorkflowEngine } from '@/modules/ledger/approval-workflow';
import { handleRouteError } from '@/server/http/handle-route';
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const RejectApprovalSchema = z.object({
  reason: z.string().min(1, "Rejection reason required").max(2048),
});

/**
 * POST /api/v1/transactions/[id]/approvals/reject
 * 
 * Reject a pending transaction approval.
 */
export async function POST(request: Request, context: any) {
  return withRuntimeContext(request, async (ctx) => {
    const { params } = context;
    try {
  
      const transactionId = (await params).id;
      const rawBody = await request.json();
      const parsed = RejectApprovalSchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: "VALIDATION", message: parsed.error.issues[0].message } },
          { status: 400 }
        );
      }
      const { reason } = parsed.data;
  
      // Reject the transaction
      await ApprovalWorkflowEngine.rejectTransaction(
        transactionId,
        ctx.tenant.companyId,
        ctx.tenant.userId!,
        ctx.tenant.role,
        reason
      );
  
      return NextResponse.json({
        success: true,
        message: 'Transaction rejected',
      });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}
