import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "reporting.audience");

    const { AudienceBuilder } = await import("@/modules/financial-reporting/audience-builder");
    const builder = new (AudienceBuilder as unknown as new () => { getPresets: () => unknown[] })();
    const presets = builder.getPresets();

    return NextResponse.json(
      { presets },
      { headers: { ...cacheHeaders(3600) } },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
