import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { OrchestrationService } from "@/modules/orchestration";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "orchestration.read");
    const periodStart = request.nextUrl.searchParams.get("periodStart") ?? undefined;
    const periodEnd = request.nextUrl.searchParams.get("periodEnd") ?? undefined;
    const data = await OrchestrationService.getAnalytics(ctx, periodStart, periodEnd);
    return NextResponse.json(data);
  } catch (error) {
    return handleRouteError(error, request);
  }
}
