import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { riskService, RiskService } from "@/modules/risk";

type RouteContext = { params: Promise<{ alertId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { alertId } = await context.params;
    const result = await riskService.acknowledgeAlert(ctx, alertId);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
