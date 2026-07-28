import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody, cacheHeaders, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { IntelligenceNotificationService } from "@/modules/intelligence-platform";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "intelligence.read");
  
      const alertType = request.nextUrl.searchParams.get("alertType") ?? undefined;
      const isResolved = request.nextUrl.searchParams.get("isResolved");
      const severity = request.nextUrl.searchParams.get("severity") ?? undefined;
  
      const resolvedFilter = isResolved === "true" ? true : isResolved === "false" ? false : undefined;
  
      const items = await IntelligenceNotificationService.getAlerts(ctx.tenant, {
        alertType,
        isResolved: resolvedFilter,
        severity,
      });
  
      return NextResponse.json({ items }, { headers: { ...cacheHeaders(15) } });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}

export async function PUT(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "intelligence.read");
  
      const { id } = await parseJsonBody<{ id: string }>(request);
  
      await IntelligenceNotificationService.resolveAlert(ctx.tenant, id);
  
      return NextResponse.json({ success: true }, { headers: { ...noCacheHeaders() } });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}
