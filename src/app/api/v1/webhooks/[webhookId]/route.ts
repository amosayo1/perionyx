import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { WebhookService } from "@/modules/webhooks";
import { rbacService } from "@/modules/rbac/rbac.service";

type RouteContext = { params: Promise<{ webhookId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'admin.webhooks');
    const { webhookId } = await context.params;
    const deliveries = await WebhookService.getDeliveries(ctx, webhookId);
    return NextResponse.json({ items: deliveries });
  } catch (error) {
    return handleRouteError(error);
  }
}
