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
  
      const transactionId = (await params).id;
  
      // Approve this step
      const requirements = await ApprovalWorkflowEngine.approveTransaction(
        transactionId,
        ctx.tenant.companyId,
        ctx.tenant.userId!,
        ctx.tenant.role
      );
  
      // If fully approved, execute the stored ledger lines
      let executionResult: { completed: boolean; error?: string } | undefined;
      if (requirements.canBePosted) {
        executionResult = await ApprovalWorkflowEngine.completeTransaction(
          transactionId,
          ctx.tenant.companyId,
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
  });
}
