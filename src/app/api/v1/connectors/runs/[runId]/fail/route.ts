import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { ConnectorRunService } from "@/modules/connectors";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

type RouteContext = { params: Promise<{ runId: string }> };

export async function POST(request: Request, context: RouteContext) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'connectors.sync');
      const { runId } = await context.params;
      const body = await parseJsonBody<{ error?: unknown }>(request);
      const result = await ConnectorRunService.failRun(ctx.tenant, runId, body.error as string);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
