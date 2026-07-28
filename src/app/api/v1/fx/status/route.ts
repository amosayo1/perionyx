import { NextResponse } from "next/server";
import { cacheHeaders } from "@/server/http/handle-route";
import { FxService } from "@/modules/fx/fx.service";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    if (!ctx.tenant.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'treasury.read');
  
    const status = await FxService.getSyncStatus(ctx.tenant.companyId);
    const health = await FxService.checkHealth(ctx.tenant.companyId);
  
    return NextResponse.json({ ...status, ...health }, { headers: { ...cacheHeaders(60) } });
  });
}
