import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { FxService } from "@/modules/fx/fx.service";
import { rbacService, RBACService } from "@/modules/rbac/rbac.service";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ctx = requireTenantContext(
    session.user.id,
    session.user.activeCompanyId,
    session.user.companyRole,
  );

  await rbacService.ensurePermission(ctx.userId, ctx.companyId, "admin.manage_roles");

  const result = await FxService.syncRates(ctx.companyId, ctx.userId);

  if (!result.success) {
    return NextResponse.json(result, { status: 502 });
  }

  return NextResponse.json(result);
}
