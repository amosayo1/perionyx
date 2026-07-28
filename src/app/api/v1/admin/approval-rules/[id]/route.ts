import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { ApprovalPolicyService } from '@/modules/rbac/approval-policy.service';
import { handleRouteError } from '@/server/http/handle-route';
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const UpdateRuleSchema = z.object({
  name: z.string().min(1).max(256).optional(),
  description: z.string().max(1024).optional(),
  priority: z.number().int().min(0).max(10000).optional(),
  scope: z.string().max(128).optional(),
  scopeId: z.string().max(128).optional(),
  minAmount: z.number().nonnegative().optional(),
  maxAmount: z.number().nonnegative().optional(),
  applicableTransactionTypes: z.array(z.string().max(128)).optional(),
  applicableConnectorTypes: z.array(z.string().max(128)).optional(),
  requiredApprovalsCount: z.number().int().min(1).max(20).optional(),
  sequentialApproval: z.boolean().optional(),
  dualApprovalRequired: z.boolean().optional(),
  escalationTimeoutHours: z.number().int().min(0).max(8760).optional(),
  autoEscalateAfterHours: z.number().int().min(0).max(8760).optional(),
  requiresComplianceReview: z.boolean().optional(),
  expiresAt: z.string().datetime().optional(),
  conditions: z.any().optional(),
  approvalSteps: z.array(z.any()).optional(),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { id } = await context.params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'approvals.configure');
  
      const rule = await ApprovalPolicyService.getRuleById(ctx.tenant.companyId, id);
      return NextResponse.json({ success: true, rule });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { id } = await context.params;
  
      const rawBody = await request.json();
      const parsed = UpdateRuleSchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json({ error: { code: "VALIDATION", message: parsed.error.issues[0].message } }, { status: 400 });
      }
      const body = parsed.data;
      const rule = await ApprovalPolicyService.updateRule(ctx.tenant.companyId, ctx.tenant.userId, {
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
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { id } = await context.params;
  
      await ApprovalPolicyService.deleteRule(ctx.tenant.companyId, ctx.tenant.userId, id);
      return NextResponse.json({ success: true });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}
