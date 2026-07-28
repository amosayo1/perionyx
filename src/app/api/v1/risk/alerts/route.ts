import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { riskService, RiskService } from "@/modules/risk";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'risk.read');
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status") ?? undefined;
      const severity = searchParams.get("severity") ?? undefined;
      const category = searchParams.get("category") ?? undefined;
      const result = await riskService.listAlerts(ctx.tenant, { status, severity, category });
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
