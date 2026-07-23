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
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "integration.connector.read");
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
}
