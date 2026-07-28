import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { IntegrationAuditService } from "@/modules/integration-platform";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.audit");
      const { searchParams } = new URL(request.url);
      const instanceId = searchParams.get("instanceId") ?? undefined;
      const action = searchParams.get("action") ?? undefined;
      const limit = parseInt(searchParams.get("limit") ?? "50");
      const offset = parseInt(searchParams.get("offset") ?? "0");
      const result = await IntegrationAuditService.list(ctx.tenant, { instanceId, action, limit, offset });
      return NextResponse.json(result, { headers: { ...cacheHeaders(15) } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
