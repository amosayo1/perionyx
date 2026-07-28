import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { ConnectorRunService } from "@/modules/connectors";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

type RouteContext = { params: Promise<{ connectorId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'connectors.read');
      const { connectorId } = await context.params;
      const result = await ConnectorRunService.getConnector(ctx.tenant, connectorId);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
