import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { listConnectorConfigs, createConnectorConfig } from "@/modules/connector-platform/config";
import { connectorPlatformRegistry } from "@/modules/connector-platform/registry";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const configs = await listConnectorConfigs(ctx);
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
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await req.json();

    const config = await createConnectorConfig(ctx, {
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
}
