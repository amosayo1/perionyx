import { NextResponse } from "next/server";
import { executiveIntelligenceEngine } from "@/server/intelligence";
import { handleRouteError, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'analytics.read');
  
      const brief = await executiveIntelligenceEngine.generateBrief(ctx.tenant.companyId);
      return NextResponse.json({ brief }, { headers: noCacheHeaders() });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}
