import { NextResponse } from "next/server";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { IntegrationRegistry } from "@/modules/integration-platform";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.marketplace");
      const defs = await IntegrationRegistry.getAllDefinitions();
      const connectors = defs.map(IntegrationRegistry.toCapabilityInfo);
      return NextResponse.json({ connectors }, { headers: { ...cacheHeaders(300) } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
