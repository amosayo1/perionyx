import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody, cacheHeaders, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { ConflictResolutionService } from "@/modules/integration-platform";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.conflict");
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status") ?? undefined;
      const instanceId = searchParams.get("instanceId") ?? undefined;
      const limit = parseInt(searchParams.get("limit") ?? "50");
      const offset = parseInt(searchParams.get("offset") ?? "0");
      const result = await ConflictResolutionService.listConflicts(ctx.tenant, { status, instanceId, limit, offset });
      return NextResponse.json(result, { headers: { ...cacheHeaders(15) } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.conflict");
      const body = await parseJsonBody<{ conflictId?: string; conflictIds?: string[]; resolution: string; resolvedBy: string }>(request);
      if (body.conflictIds && Array.isArray(body.conflictIds)) {
        const count = await ConflictResolutionService.bulkResolve(ctx.tenant, body.conflictIds, body.resolution as any, body.resolvedBy);
        return NextResponse.json({ count }, { headers: { ...noCacheHeaders() } });
      }
      if (body.conflictId) {
        await ConflictResolutionService.resolve(ctx.tenant, body.conflictId, body.resolution as any, body.resolvedBy);
        return NextResponse.json({ resolved: true }, { headers: { ...noCacheHeaders() } });
      }
      return NextResponse.json({ error: "conflictId or conflictIds required" }, { status: 400 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
