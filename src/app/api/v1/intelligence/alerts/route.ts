import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody, cacheHeaders, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { IntelligenceNotificationService } from "@/modules/intelligence-platform";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "intelligence.read");

    const alertType = request.nextUrl.searchParams.get("alertType") ?? undefined;
    const isResolved = request.nextUrl.searchParams.get("isResolved");
    const severity = request.nextUrl.searchParams.get("severity") ?? undefined;

    const resolvedFilter = isResolved === "true" ? true : isResolved === "false" ? false : undefined;

    const items = await IntelligenceNotificationService.getAlerts(ctx, {
      alertType,
      isResolved: resolvedFilter,
      severity,
    });

    return NextResponse.json({ items }, { headers: { ...cacheHeaders(15) } });
  } catch (error) {
    return handleRouteError(error, request);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "intelligence.read");

    const { id } = await parseJsonBody<{ id: string }>(request);

    await IntelligenceNotificationService.resolveAlert(ctx, id);

    return NextResponse.json({ success: true }, { headers: { ...noCacheHeaders() } });
  } catch (error) {
    return handleRouteError(error, request);
  }
}
