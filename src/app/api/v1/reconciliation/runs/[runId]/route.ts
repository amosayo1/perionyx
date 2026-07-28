import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { ReconciliationService } from "@/modules/reconciliation";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

type RouteContext = { params: Promise<{ runId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'reconciliation.view');
      const { runId } = await context.params;
      const result = await ReconciliationService.getRun(ctx.tenant, runId);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
