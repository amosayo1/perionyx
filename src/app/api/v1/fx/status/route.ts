import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { cacheHeaders } from "@/server/http/handle-route";
import { FxService } from "@/modules/fx/fx.service";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ctx = requireTenantContext(
    session.user.id,
    session.user.activeCompanyId,
    session.user.companyRole,
  );
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'treasury.read');

  const status = await FxService.getSyncStatus(ctx.companyId);
  const health = await FxService.checkHealth(ctx.companyId);

  return NextResponse.json({ ...status, ...health }, { headers: { ...cacheHeaders(60) } });
}
