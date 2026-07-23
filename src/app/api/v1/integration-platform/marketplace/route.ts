import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { IntegrationRegistry } from "@/modules/integration-platform";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "integration.marketplace");
    const defs = await IntegrationRegistry.getAllDefinitions();
    const connectors = defs.map(IntegrationRegistry.toCapabilityInfo);
    return NextResponse.json({ connectors }, { headers: { ...cacheHeaders(300) } });
  } catch (error) {
    return handleRouteError(error);
  }
}
