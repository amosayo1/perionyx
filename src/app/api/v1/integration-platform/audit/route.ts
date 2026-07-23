import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { IntegrationAuditService } from "@/modules/integration-platform";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "integration.audit");
    const { searchParams } = new URL(request.url);
    const instanceId = searchParams.get("instanceId") ?? undefined;
    const action = searchParams.get("action") ?? undefined;
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const offset = parseInt(searchParams.get("offset") ?? "0");
    const result = await IntegrationAuditService.list(ctx, { instanceId, action, limit, offset });
    return NextResponse.json(result, { headers: { ...cacheHeaders(15) } });
  } catch (error) {
    return handleRouteError(error);
  }
}
