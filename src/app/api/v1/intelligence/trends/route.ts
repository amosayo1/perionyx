import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { TrendEngine } from "@/modules/intelligence-platform";
import type { TrendPeriod } from "@/modules/intelligence-platform/types";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "intelligence.read");
  
      const trendKey = request.nextUrl.searchParams.get("trendKey");
      const rawPeriod = request.nextUrl.searchParams.get("period");
      const keys = request.nextUrl.searchParams.get("keys");
  
      const period = rawPeriod as TrendPeriod | null;
  
      if (trendKey) {
        const trend = await TrendEngine.getTrend(ctx.tenant, trendKey, period as TrendPeriod);
        return NextResponse.json(trend, { headers: { ...cacheHeaders(60) } });
      }
  
      const parsedKeys = keys ? keys.split(",").map((k) => k.trim()).filter(Boolean) : undefined;
      const items = await TrendEngine.getTrends(ctx.tenant, { period: period ?? undefined, keys: parsedKeys });
      return NextResponse.json({ items }, { headers: { ...cacheHeaders(60) } });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}
