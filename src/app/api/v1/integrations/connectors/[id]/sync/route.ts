import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { getConnectorConfig, initializeConnectorInstance } from "@/modules/connector-platform/config";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(_req, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'connectors.sync');
  
      const config = await getConnectorConfig(ctx.tenant, id);
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
  });
}
