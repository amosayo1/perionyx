import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { KPIFramework } from "@/modules/intelligence-platform";
import type { KPICategory } from "@/modules/intelligence-platform/types";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "intelligence.read");
  
      const key = request.nextUrl.searchParams.get("key");
      const history = request.nextUrl.searchParams.get("history");
      const rawCategory = request.nextUrl.searchParams.get("category");
  
      if (history) {
        const data = await KPIFramework.getHistory(ctx.tenant, history);
        return NextResponse.json(data, { headers: { ...cacheHeaders(60) } });
      }
  
      if (key) {
        const kpi = await KPIFramework.getKPI(ctx.tenant, key);
        return NextResponse.json(kpi, { headers: { ...cacheHeaders(30) } });
      }
  
      const category = rawCategory as KPICategory | null;
      const items = await KPIFramework.getKPIsByCategory(ctx.tenant, category as KPICategory);
      return NextResponse.json({ items }, { headers: { ...cacheHeaders(30) } });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}
