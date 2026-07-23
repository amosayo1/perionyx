import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { TrendEngine } from "@/modules/intelligence-platform";
import type { TrendPeriod } from "@/modules/intelligence-platform/types";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "intelligence.read");

    const trendKey = request.nextUrl.searchParams.get("trendKey");
    const rawPeriod = request.nextUrl.searchParams.get("period");
    const keys = request.nextUrl.searchParams.get("keys");

    const period = rawPeriod as TrendPeriod | null;

    if (trendKey) {
      const trend = await TrendEngine.getTrend(ctx, trendKey, period as TrendPeriod);
      return NextResponse.json(trend, { headers: { ...cacheHeaders(60) } });
    }

    const parsedKeys = keys ? keys.split(",").map((k) => k.trim()).filter(Boolean) : undefined;
    const items = await TrendEngine.getTrends(ctx, { period: period ?? undefined, keys: parsedKeys });
    return NextResponse.json({ items }, { headers: { ...cacheHeaders(60) } });
  } catch (error) {
    return handleRouteError(error, request);
  }
}
