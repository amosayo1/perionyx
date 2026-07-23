import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { getConnectorConfig, initializeConnectorInstance } from "@/modules/connector-platform/config";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'connectors.sync');

    const config = await getConnectorConfig(ctx, id);
    if (!config) return NextResponse.json({ error: "Connector not found" }, { status: 404 });

    const connector = initializeConnectorInstance(config);
    if (!connector.syncData) {
      return NextResponse.json({ error: "Connector does not support sync" }, { status: 400 });
    }

    const result = await connector.syncData({ fullSync: true });
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
