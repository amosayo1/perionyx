import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { PolicyEngineService } from "@/modules/policies";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'security.policies');
      const body = await parseJsonBody<unknown>(request);
      const result = await PolicyEngineService.testAllPolicies(ctx.tenant, body as any);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
