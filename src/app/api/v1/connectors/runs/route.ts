import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { ConnectorRunService } from "@/modules/connectors";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'connectors.read');
      const { searchParams } = new URL(request.url);
      const connectorId = searchParams.get("connectorId") ?? undefined;
      const status = searchParams.get("status") ?? undefined;
      const result = await ConnectorRunService.listRuns(ctx.tenant, { connectorId, status });
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await parseJsonBody<{ connectorId: string; event?: string; input?: unknown }>(request);
      const result = await ConnectorRunService.createRun(ctx.tenant, body.connectorId, body.event ?? "", body.input as Record<string, any> | undefined);
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
