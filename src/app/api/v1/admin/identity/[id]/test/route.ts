import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { getProviderConfig } from "@/modules/identity/config";
import { identityProviderRegistry } from "@/modules/identity/registry";
import { MicrosoftEntraIdProvider } from "@/modules/identity/adapters/entra-id";
import { GoogleWorkspaceProvider } from "@/modules/identity/adapters/google-workspace";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const providerCtors: Record<string, new () => any> = {
  "entra-id": MicrosoftEntraIdProvider,
  "google-workspace": GoogleWorkspaceProvider,
};

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(_req, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.security');
  
      const config = await getProviderConfig(id);
      if (!config) {
        return NextResponse.json({ error: "Provider not found" }, { status: 404 });
      }
  
      const existing = identityProviderRegistry.getInstance(id);
      const provider = existing ?? (() => {
        const Ctor = providerCtors[config.kind];
        if (!Ctor) return null;
        const inst = new Ctor();
        inst.initialize(config);
        return inst;
      })();
  
      if (!provider) {
        return NextResponse.json({ ok: false, message: `Unknown provider kind: ${config.kind}` });
      }
  
      const result = await provider.healthCheck();
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
