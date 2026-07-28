import { NextResponse } from "next/server";
import { FxService } from "@/modules/fx/fx.service";
import { rbacService, RBACService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    if (!ctx.tenant.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "admin.manage_roles");
  
    const result = await FxService.syncRates(ctx.tenant.companyId, ctx.tenant.userId);
  
    if (!result.success) {
      return NextResponse.json(result, { status: 502 });
    }
  
    return NextResponse.json(result);
  });
}
