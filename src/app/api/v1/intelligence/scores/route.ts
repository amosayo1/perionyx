import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody, cacheHeaders, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { IntelligencePlatformService } from "@/modules/intelligence-platform";
import type { ScoreType } from "@/modules/intelligence-platform/types";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "intelligence.read");

    const scoreType = request.nextUrl.searchParams.get("scoreType") as ScoreType | null;

    if (scoreType) {
      const score = await IntelligencePlatformService.getScore(ctx, scoreType);
      return NextResponse.json(score, { headers: { ...cacheHeaders(30) } });
    }

    const items = await IntelligencePlatformService.getScores(ctx);
    return NextResponse.json({ items }, { headers: { ...cacheHeaders(30) } });
  } catch (error) {
    return handleRouteError(error, request);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "intelligence.read");

    const result = await IntelligencePlatformService.runFullAssessment(ctx);
    return NextResponse.json(result, { status: 202, headers: { ...noCacheHeaders() } });
  } catch (error) {
    return handleRouteError(error, request);
  }
}
