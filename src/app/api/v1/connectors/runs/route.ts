import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { ConnectorRunService } from "@/modules/connectors";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'connectors.read');
    const { searchParams } = new URL(request.url);
    const connectorId = searchParams.get("connectorId") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const result = await ConnectorRunService.listRuns(ctx, { connectorId, status });
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await parseJsonBody<{ connectorId: string; event?: string; input?: unknown }>(request);
    const result = await ConnectorRunService.createRun(ctx, body.connectorId, body.event ?? "", body.input as Record<string, any> | undefined);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
