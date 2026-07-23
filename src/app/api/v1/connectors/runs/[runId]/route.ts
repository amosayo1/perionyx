import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { ConnectorRunService } from "@/modules/connectors";
import { rbacService } from "@/modules/rbac/rbac.service";

type RouteContext = { params: Promise<{ runId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'connectors.read');
    const { runId } = await context.params;
    const result = await ConnectorRunService.getRun(ctx, runId);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
