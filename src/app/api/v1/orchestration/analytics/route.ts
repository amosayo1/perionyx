import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { OrchestrationService } from "@/modules/orchestration";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "orchestration.read");
      const periodStart = request.nextUrl.searchParams.get("periodStart") ?? undefined;
      const periodEnd = request.nextUrl.searchParams.get("periodEnd") ?? undefined;
      const data = await OrchestrationService.getAnalytics(ctx.tenant, periodStart, periodEnd);
      return NextResponse.json(data);
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}
