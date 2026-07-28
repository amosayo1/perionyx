import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { ReconciliationService } from "@/modules/reconciliation";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'reconciliation.view');
      const { searchParams } = new URL(request.url);
      const resolved = searchParams.get("resolved") === "true" ? true : searchParams.get("resolved") === "false" ? false : undefined;
      const severity = searchParams.get("severity") ?? undefined;
      const result = await ReconciliationService.listExceptions(ctx.tenant, { resolved, severity });
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await parseJsonBody<{ exceptionId: string }>(request);
      const result = await ReconciliationService.resolveException(ctx.tenant, body.exceptionId);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
