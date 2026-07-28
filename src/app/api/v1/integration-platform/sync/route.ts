import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody, cacheHeaders, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { SyncEngineService } from "@/modules/integration-platform";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.sync");
      const body = await parseJsonBody<{ instanceId: string; syncType: string }>(request);
      if (!body.instanceId || !body.syncType) {
        return NextResponse.json({ error: "instanceId and syncType are required" }, { status: 400 });
      }
      const sync = await SyncEngineService.startSync(ctx.tenant, body.instanceId, body.syncType as any);
      return NextResponse.json({ sync }, { status: 202, headers: { ...noCacheHeaders() } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.sync");
      const { searchParams } = new URL(request.url);
      const instanceId = searchParams.get("instanceId") ?? undefined;
      const status = searchParams.get("status") ?? undefined;
      const limit = parseInt(searchParams.get("limit") ?? "50");
      const offset = parseInt(searchParams.get("offset") ?? "0");
      const result = await SyncEngineService.getSyncHistory(ctx.tenant, instanceId, { status, limit, offset });
      return NextResponse.json(result, { headers: { ...cacheHeaders(15) } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
