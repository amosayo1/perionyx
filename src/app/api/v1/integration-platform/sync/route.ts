import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody, cacheHeaders, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { SyncEngineService } from "@/modules/integration-platform";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "integration.sync");
    const body = await parseJsonBody<{ instanceId: string; syncType: string }>(request);
    if (!body.instanceId || !body.syncType) {
      return NextResponse.json({ error: "instanceId and syncType are required" }, { status: 400 });
    }
    const sync = await SyncEngineService.startSync(ctx, body.instanceId, body.syncType as any);
    return NextResponse.json({ sync }, { status: 202, headers: { ...noCacheHeaders() } });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "integration.sync");
    const { searchParams } = new URL(request.url);
    const instanceId = searchParams.get("instanceId") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const offset = parseInt(searchParams.get("offset") ?? "0");
    const result = await SyncEngineService.getSyncHistory(ctx, instanceId, { status, limit, offset });
    return NextResponse.json(result, { headers: { ...cacheHeaders(15) } });
  } catch (error) {
    return handleRouteError(error);
  }
}
