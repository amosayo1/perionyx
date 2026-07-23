import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { getConnectorConfig } from "@/modules/connector-platform/config";
import { ConnectorLifecycle } from "@/modules/connector-platform/lifecycle";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'connectors.read');

    const config = await getConnectorConfig(ctx, id);
    if (!config) return NextResponse.json({ error: "Connector not found" }, { status: 404 });

    const health = await ConnectorLifecycle.healthCheck(ctx, id);
    return NextResponse.json(health);
  } catch (error) {
    return handleRouteError(error);
  }
}
