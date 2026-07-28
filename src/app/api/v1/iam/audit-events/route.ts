import { NextResponse } from "next/server";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { iamAdminService } from "@/server/iam/admin";
import { IAMAuditEvent } from "@/server/iam/audit-events";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'audit.read');
  
      const { searchParams } = new URL(request.url);
      const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);
      const cursor = searchParams.get("cursor") ?? undefined;
      const search = searchParams.get("search") ?? undefined;
      const actions = searchParams.get("actions")?.split(",").filter(Boolean) ?? undefined;
      const actorUserId = searchParams.get("actorUserId") ?? undefined;
  
      const result = await iamAdminService.searchAuditLogs(ctx.tenant.companyId, {
        limit,
        cursor,
        search,
        actions,
        actorUserId,
      });
  
      return NextResponse.json({
        rows: result.rows,
        nextCursor: result.nextCursor,
        availableEventTypes: IAMAuditEvent,
      }, { headers: cacheHeaders(15) });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
