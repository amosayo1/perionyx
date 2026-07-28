import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { PolicyEngineService } from "@/modules/policies";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'security.policies');
      const { searchParams } = new URL(request.url);
      const includeDisabled = searchParams.get("includeDisabled") === "true" ? true : searchParams.get("includeDisabled") === "false" ? false : undefined;
      const result = await PolicyEngineService.listPolicies(ctx.tenant, includeDisabled);
      return NextResponse.json(result, { headers: { ...cacheHeaders(30) } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await parseJsonBody<unknown>(request);
      const result = await PolicyEngineService.createPolicy(ctx.tenant, body as any);
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
