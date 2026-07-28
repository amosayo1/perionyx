import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { WebhookService } from "@/modules/webhooks";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

type RouteContext = { params: Promise<{ webhookId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.webhooks');
      const { webhookId } = await context.params;
      const deliveries = await WebhookService.getDeliveries(ctx.tenant, webhookId);
      return NextResponse.json({ items: deliveries });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
