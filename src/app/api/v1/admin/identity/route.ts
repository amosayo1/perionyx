import { NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError } from "@/server/http/handle-route";
import { getProviderConfigs, createProviderConfig } from "@/modules/identity/config";
import { identityProviderRegistry } from "@/modules/identity/registry";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const createSchema = z.object({
  kind: z.enum(["local", "entra-id", "google-workspace", "okta", "saml", "oidc"]),
  label: z.string().min(1).max(100),
  domain: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.security');
  
      const configs = await getProviderConfigs(ctx.tenant.companyId);
      const kinds = identityProviderRegistry.getRegisteredKinds();
  
      return NextResponse.json({
        providers: configs,
        availableKinds: kinds,
      });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const body = createSchema.parse(await req.json());
      const config = await createProviderConfig(ctx.tenant.companyId, body.kind, body.label, body.metadata, body.domain);
  
      return NextResponse.json(config, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
