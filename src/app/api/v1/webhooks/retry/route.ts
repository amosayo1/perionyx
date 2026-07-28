import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { WebhookService } from "@/modules/webhooks";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.webhooks');
      const body = await parseJsonBody<{ deliveryId: string }>(request);
      const result = await WebhookService.retryDelivery(ctx.tenant, body.deliveryId);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
