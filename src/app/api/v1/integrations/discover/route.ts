import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { connectorDiscovery } from "@/modules/connector-platform/discovery";
import { connectorPlatformRegistry } from "@/modules/connector-platform/registry";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'connectors.read');

    const { searchParams } = new URL(req.url);
    const capability = searchParams.get("capability");
    const category = searchParams.get("category");
    const authMethod = searchParams.get("authMethod");
    const search = searchParams.get("search");

    const providers = connectorDiscovery.findProviders({
      capabilities: capability ? [capability as any] : undefined,
      category: category as any ?? undefined,
      authMethod: authMethod as any ?? undefined,
      search: search ?? undefined,
    });

    const categories = connectorDiscovery.listCategories();
    const knownKinds = connectorPlatformRegistry.getRegisteredKinds();

    return NextResponse.json({
      providers,
      categories,
      totalProviders: providers.length,
      knownKinds,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
