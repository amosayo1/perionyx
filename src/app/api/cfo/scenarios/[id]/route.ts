import { NextResponse } from "next/server";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { handleRouteError } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(_req, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "cfo_advisor.read");
  
      const scenario = await CFOAdvisorService.getScenario(ctx.tenant, id);
      return NextResponse.json(scenario);
    } catch (err) {
      return handleRouteError(err, _req);
    }
  });
}
