import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody, cacheHeaders, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { ScorecardService } from "@/modules/intelligence-platform";
import type { ScorecardRole } from "@/modules/intelligence-platform/types";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "intelligence.read");

    const rawRole = request.nextUrl.searchParams.get("role");
    const role = rawRole as ScorecardRole | null;

    const scorecard = await ScorecardService.getScorecard(ctx, role as ScorecardRole);
    return NextResponse.json(scorecard, { headers: { ...cacheHeaders(60) } });
  } catch (error) {
    return handleRouteError(error, request);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "intelligence.read");

    const { role } = await parseJsonBody<{ role: ScorecardRole }>(request);

    const scorecard = await ScorecardService.generate(ctx, role);
    return NextResponse.json(scorecard, { status: 201, headers: { ...noCacheHeaders() } });
  } catch (error) {
    return handleRouteError(error, request);
  }
}
