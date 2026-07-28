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
      const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
      const cursor = searchParams.get("cursor") ?? undefined;
      const result = await ReconciliationService.listRuns(ctx.tenant, limit, cursor);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await parseJsonBody<{ type?: string }>(request);
      const runId = await ReconciliationService.initiateRun(ctx.tenant, body.type);
      return NextResponse.json({ runId }, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
