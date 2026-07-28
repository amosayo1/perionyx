import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { OrchestrationService } from "@/modules/orchestration";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "orchestration.write");
      const body = await parseJsonBody<{ eventType: string; source?: string; payload?: Record<string, unknown> }>(request);
      await OrchestrationService.emitEvent(ctx.tenant, body.eventType, body.source ?? "api", body.payload);
      return NextResponse.json({ emitted: true, eventType: body.eventType }, { status: 202 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
