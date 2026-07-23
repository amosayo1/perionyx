import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { executiveIntelligenceEngine } from "@/server/intelligence";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import type { InsightPriority, IntelligenceCategory, InsightStatus } from "@/server/intelligence/types";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'analytics.read');

    const url = new URL(request.url);
    const minPriority = url.searchParams.get("minPriority") as InsightPriority | null;
    const category = url.searchParams.get("category") as IntelligenceCategory | null;
    const status = url.searchParams.get("status") as InsightStatus | null;

    const insights = await executiveIntelligenceEngine.getInsights(ctx.companyId, {
      minPriority: minPriority ?? undefined,
      category: category ?? undefined,
      status: status ?? undefined,
    });

    const total = executiveIntelligenceEngine.getInsightCount(ctx.companyId);
    return NextResponse.json({ insights, total }, { headers: cacheHeaders(30) });
  } catch (error) {
    return handleRouteError(error, request);
  }
}
