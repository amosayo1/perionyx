import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { SyncEngineService } from "@/modules/integration-platform";
import { prisma } from "@/server/db/prisma";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.sync");
      const { searchParams } = new URL(request.url);
      const syncId = searchParams.get("syncId");
      if (!syncId) return NextResponse.json({ error: "syncId required" }, { status: 400 });
      const sync = await prisma.syncHistory.findUnique({ where: { id: syncId } });
      if (!sync) return NextResponse.json({ error: "Sync not found" }, { status: 404 });
      return NextResponse.json({ sync });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.sync");
      const body = await parseJsonBody<{ syncId: string; status: string; result: any }>(request);
      if (!body.syncId || !body.status) return NextResponse.json({ error: "syncId and status required" }, { status: 400 });
      let sync;
      if (body.status === "completed") {
        sync = await SyncEngineService.completeSync(ctx.tenant, body.syncId, body.result);
      } else {
        sync = await SyncEngineService.failSync(ctx.tenant, body.syncId, body.result?.error ?? "Unknown error", body.result);
      }
      return NextResponse.json({ sync }, { headers: { ...noCacheHeaders() } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
