import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { ApprovalPolicyService } from '@/modules/rbac/approval-policy.service';
import { handleRouteError } from '@/server/http/handle-route';
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const ToggleBodySchema = z.object({
  enabled: z.boolean({ message: "enabled is required" }),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { id } = await context.params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'approvals.configure');
  
      const rawBody = await request.json();
      const parsed = ToggleBodySchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json({ error: { code: "VALIDATION", message: parsed.error.issues[0].message } }, { status: 400 });
      }
      const { enabled } = parsed.data;
  
      const rule = await ApprovalPolicyService.toggleRuleStatus(
        ctx.tenant.companyId,
        ctx.tenant.userId,
        id,
        enabled
      );
  
      return NextResponse.json({ success: true, rule });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}
