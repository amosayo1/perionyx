import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { SandboxService } from "@/modules/integration-platform";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.sandbox");
      const datasets = await SandboxService.getAvailableDatasets(ctx.tenant);
      return NextResponse.json({ datasets });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.sandbox");
      const body = await parseJsonBody<{ connectorDefId: string; datasetId: string }>(request);
      const instance = await SandboxService.createSandboxInstance(ctx.tenant, body.connectorDefId, body.datasetId);
      return NextResponse.json({ instance }, { status: 201, headers: { ...noCacheHeaders() } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
