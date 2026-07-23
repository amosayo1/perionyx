import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { executiveIntelligenceEngine } from "@/server/intelligence";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'analytics.read');

    const url = new URL(request.url);
    const overall = url.searchParams.get("overall") === "true";

    const health = overall
      ? await executiveIntelligenceEngine.getOverallHealth(ctx.companyId)
      : await executiveIntelligenceEngine.getBusinessHealth(ctx.companyId);

    return NextResponse.json(health, { headers: cacheHeaders(30) });
  } catch (error) {
    return handleRouteError(error, request);
  }
}
