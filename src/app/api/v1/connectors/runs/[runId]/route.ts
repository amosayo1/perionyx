import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { ConnectorRunService } from "@/modules/connectors";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

type RouteContext = { params: Promise<{ runId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'connectors.read');
      const { runId } = await context.params;
      const result = await ConnectorRunService.getRun(ctx.tenant, runId);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
