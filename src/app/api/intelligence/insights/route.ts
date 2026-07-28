import { NextResponse } from "next/server";
import { executiveIntelligenceEngine } from "@/server/intelligence";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import type { InsightPriority, IntelligenceCategory, InsightStatus } from "@/server/intelligence/types";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'analytics.read');
  
      const url = new URL(request.url);
      const minPriority = url.searchParams.get("minPriority") as InsightPriority | null;
      const category = url.searchParams.get("category") as IntelligenceCategory | null;
      const status = url.searchParams.get("status") as InsightStatus | null;
  
      const insights = await executiveIntelligenceEngine.getInsights(ctx.tenant.companyId, {
        minPriority: minPriority ?? undefined,
        category: category ?? undefined,
        status: status ?? undefined,
      });
  
      const total = executiveIntelligenceEngine.getInsightCount(ctx.tenant.companyId);
      return NextResponse.json({ insights, total }, { headers: cacheHeaders(30) });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}
