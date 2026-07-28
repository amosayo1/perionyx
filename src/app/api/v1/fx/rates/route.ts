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
  
    const rates = await FxService.getLatestRates(ctx.tenant.companyId);
    const available = await FxService.listAvailableCurrencies();
  
    return NextResponse.json({ rates, available }, { headers: { ...cacheHeaders(120) } });
  });
}
