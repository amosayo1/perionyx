import { NextResponse } from "next/server";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "reporting.audience");
  
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
  });
}
