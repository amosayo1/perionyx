import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { globalSearch } from "@/modules/search/global-search";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'analytics.read');
      const url = new URL(request.url);
      const q = url.searchParams.get("q") ?? "";
      const limit = Math.min(Number(url.searchParams.get("limit")) || 20, 50);
  
      const results = await globalSearch(ctx.tenant, q, limit);
      return NextResponse.json({ items: results, total: results.length, query: q });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
