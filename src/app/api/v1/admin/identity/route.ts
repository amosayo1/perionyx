import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { getProviderConfigs, createProviderConfig } from "@/modules/identity/config";
import { identityProviderRegistry } from "@/modules/identity/registry";

const createSchema = z.object({
  kind: z.enum(["local", "entra-id", "google-workspace", "okta", "saml", "oidc"]),
  label: z.string().min(1).max(100),
  domain: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const configs = await getProviderConfigs(ctx.companyId);
    const kinds = identityProviderRegistry.getRegisteredKinds();

    return NextResponse.json({
      providers: configs,
      availableKinds: kinds,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const body = createSchema.parse(await req.json());
    const config = await createProviderConfig(ctx.companyId, body.kind, body.label, body.metadata, body.domain);

    return NextResponse.json(config, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
