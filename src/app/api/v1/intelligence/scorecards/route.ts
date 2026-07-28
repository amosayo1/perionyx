import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody, cacheHeaders, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { ScorecardService } from "@/modules/intelligence-platform";
import type { ScorecardRole } from "@/modules/intelligence-platform/types";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "intelligence.read");
  
      const rawRole = request.nextUrl.searchParams.get("role");
      const role = rawRole as ScorecardRole | null;
  
      const scorecard = await ScorecardService.getScorecard(ctx.tenant, role as ScorecardRole);
      return NextResponse.json(scorecard, { headers: { ...cacheHeaders(60) } });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "intelligence.read");
  
      const { role } = await parseJsonBody<{ role: ScorecardRole }>(request);
  
      const scorecard = await ScorecardService.generate(ctx.tenant, role);
      return NextResponse.json(scorecard, { status: 201, headers: { ...noCacheHeaders() } });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}
