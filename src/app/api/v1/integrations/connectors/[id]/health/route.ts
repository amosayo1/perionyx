import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { getConnectorConfig } from "@/modules/connector-platform/config";
import { ConnectorLifecycle } from "@/modules/connector-platform/lifecycle";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(_req, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'connectors.read');
  
      const config = await getConnectorConfig(ctx.tenant, id);
      if (!config) return NextResponse.json({ error: "Connector not found" }, { status: 404 });
  
      const health = await ConnectorLifecycle.healthCheck(ctx.tenant, id);
      return NextResponse.json(health);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
