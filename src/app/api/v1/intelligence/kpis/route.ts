import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { KPIFramework } from "@/modules/intelligence-platform";
import type { KPICategory } from "@/modules/intelligence-platform/types";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "intelligence.read");

    const key = request.nextUrl.searchParams.get("key");
    const history = request.nextUrl.searchParams.get("history");
    const rawCategory = request.nextUrl.searchParams.get("category");

    if (history) {
      const data = await KPIFramework.getHistory(ctx, history);
      return NextResponse.json(data, { headers: { ...cacheHeaders(60) } });
    }

    if (key) {
      const kpi = await KPIFramework.getKPI(ctx, key);
      return NextResponse.json(kpi, { headers: { ...cacheHeaders(30) } });
    }

    const category = rawCategory as KPICategory | null;
    const items = await KPIFramework.getKPIsByCategory(ctx, category as KPICategory);
    return NextResponse.json({ items }, { headers: { ...cacheHeaders(30) } });
  } catch (error) {
    return handleRouteError(error, request);
  }
}
