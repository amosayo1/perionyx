import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, cacheHeaders, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { IntegrationRegistry } from "@/modules/integration-platform";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "integration.connector.read");
    const connectors = await IntegrationRegistry.getAllDefinitions();
    return NextResponse.json({ connectors }, { headers: { ...cacheHeaders(300) } });
  } catch (error) {
    return handleRouteError(error);
  }
}
