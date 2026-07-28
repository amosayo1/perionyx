import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody, cacheHeaders, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { IntelligencePlatformService } from "@/modules/intelligence-platform";
import type { ScoreType } from "@/modules/intelligence-platform/types";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "intelligence.read");
  
      const scoreType = request.nextUrl.searchParams.get("scoreType") as ScoreType | null;
  
      if (scoreType) {
        const score = await IntelligencePlatformService.getScore(ctx.tenant, scoreType);
        return NextResponse.json(score, { headers: { ...cacheHeaders(30) } });
      }
  
      const items = await IntelligencePlatformService.getScores(ctx.tenant);
      return NextResponse.json({ items }, { headers: { ...cacheHeaders(30) } });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "intelligence.read");
  
      const result = await IntelligencePlatformService.runFullAssessment(ctx.tenant);
      return NextResponse.json(result, { status: 202, headers: { ...noCacheHeaders() } });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}
