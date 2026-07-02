import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { getProviderConfig } from "@/modules/identity/config";
import { identityProviderRegistry } from "@/modules/identity/registry";
import { MicrosoftEntraIdProvider } from "@/modules/identity/adapters/entra-id";
import { GoogleWorkspaceProvider } from "@/modules/identity/adapters/google-workspace";

const providerCtors: Record<string, new () => any> = {
  "entra-id": MicrosoftEntraIdProvider,
  "google-workspace": GoogleWorkspaceProvider,
};

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const config = await getProviderConfig(id);
    if (!config) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    const existing = identityProviderRegistry.getInstance(id);
    const provider = existing ?? (() => {
      const Ctor = providerCtors[config.kind];
      if (!Ctor) return null;
      const inst = new Ctor() as any;
      inst.initialize(config);
      identityProviderRegistry.registerInstance(id, inst);
      return inst;
    })();

    if (!provider) {
      return NextResponse.json({ ok: false, message: `Unknown provider kind: ${config.kind}` });
    }

    const result = await provider.syncDirectory([]);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
