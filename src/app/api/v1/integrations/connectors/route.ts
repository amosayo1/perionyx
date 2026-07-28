import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { listConnectorConfigs, createConnectorConfig } from "@/modules/connector-platform/config";
import { connectorPlatformRegistry } from "@/modules/connector-platform/registry";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'connectors.read');
  
      const configs = await listConnectorConfigs(ctx.tenant);
      const availableKinds = connectorPlatformRegistry.getRegisteredKinds().map((kind) => {
        try {
          const instance = connectorPlatformRegistry.createInstance(kind);
          return {
            kind,
            label: instance.label,
            description: instance.description,
            capabilities: instance.capabilities,
            authMethods: instance.supportedAuthMethods,
          };
        } catch {
          return { kind, label: kind, description: "", capabilities: [], authMethods: [] };
        }
      });
  
      return NextResponse.json({ connectors: configs, availableKinds });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const body = await req.json();
  
      const config = await createConnectorConfig(ctx.tenant, {
        name: body.name,
        kind: body.kind,
        authMethod: body.authMethod ?? "none",
        capabilities: body.capabilities ?? [],
        config: body.config ?? {},
      });
  
      return NextResponse.json(config, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
