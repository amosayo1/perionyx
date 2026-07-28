import { NextResponse } from "next/server";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { IntegrationRegistry } from "@/modules/integration-platform";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.connector.read");
      const defs = await IntegrationRegistry.getAllDefinitions();
      const categories: Record<string, typeof defs> = {};
      for (const d of defs) {
        const cat = d.category;
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(d);
      }
      return NextResponse.json({ categories }, { headers: { ...cacheHeaders(300) } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
