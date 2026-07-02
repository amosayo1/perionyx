import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { FxService } from "@/modules/fx/fx.service";

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

  const status = await FxService.getSyncStatus(ctx.companyId);
  const health = await FxService.checkHealth(ctx.companyId);

  return NextResponse.json({ ...status, ...health });
}
