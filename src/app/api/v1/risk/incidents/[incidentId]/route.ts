import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { riskService, RiskService } from "@/modules/risk";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

type RouteContext = { params: Promise<{ incidentId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'risk.read');
      const { incidentId } = await context.params;
      const result = await riskService.getIncident(ctx.tenant, incidentId);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
