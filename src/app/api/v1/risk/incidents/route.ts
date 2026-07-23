import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { riskService, RiskService } from "@/modules/risk";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'risk.read');
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;
    const severity = searchParams.get("severity") ?? undefined;
    const result = await riskService.listIncidents(ctx, { status, severity });
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
