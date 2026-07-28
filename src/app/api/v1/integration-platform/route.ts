import { NextResponse } from "next/server";
import { handleRouteError, cacheHeaders, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { IntegrationRegistry } from "@/modules/integration-platform";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.connector.read");
      const connectors = await IntegrationRegistry.getAllDefinitions();
      return NextResponse.json({ connectors }, { headers: { ...cacheHeaders(300) } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
