import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody, cacheHeaders, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { IntegrationRegistry } from "@/modules/integration-platform";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.connector.read");
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status") ?? undefined;
      const category = searchParams.get("category") ?? undefined;
      const instances = await IntegrationRegistry.listInstances(ctx.tenant, { status, category });
      return NextResponse.json({ instances }, { headers: { ...cacheHeaders(15) } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.connector.write");
      const body = await parseJsonBody<{ connectorDefId: string; name: string; config: Record<string, unknown>; authMethod: string }>(request);
      if (!body.connectorDefId || !body.name) {
        return NextResponse.json({ error: "connectorDefId and name are required" }, { status: 400 });
      }
      const instance = await IntegrationRegistry.createInstance(ctx.tenant, { connectorDefId: body.connectorDefId, name: body.name, config: body.config ?? {}, authMethod: body.authMethod as any });
      return NextResponse.json({ instance }, { status: 201, headers: { ...noCacheHeaders() } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
