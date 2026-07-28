import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { OrchestrationService } from "@/modules/orchestration";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "orchestration.read");
      const items = await OrchestrationService.listNotifications(ctx.tenant);
      return NextResponse.json({ items });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "orchestration.write");
      const body = await parseJsonBody<{
        workflowId: string; triggerOn: string; roleTarget?: string; channel?: string; template?: string;
      }>(request);
      const item = await OrchestrationService.createNotification(ctx.tenant, body);
      return NextResponse.json(item, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
