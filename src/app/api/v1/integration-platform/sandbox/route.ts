import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { SandboxService } from "@/modules/integration-platform";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "integration.sandbox");
    const datasets = await SandboxService.getAvailableDatasets(ctx);
    return NextResponse.json({ datasets });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "integration.sandbox");
    const body = await parseJsonBody<{ connectorDefId: string; datasetId: string }>(request);
    const instance = await SandboxService.createSandboxInstance(ctx, body.connectorDefId, body.datasetId);
    return NextResponse.json({ instance }, { status: 201, headers: { ...noCacheHeaders() } });
  } catch (error) {
    return handleRouteError(error);
  }
}
