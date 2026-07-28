import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { riskService, RiskService } from "@/modules/risk";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'risk.read');
      const result = await riskService.getRiskSummary(ctx.tenant);
      return NextResponse.json(result, { headers: { ...cacheHeaders(15) } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
