import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { PolicyEngineService } from "@/modules/policies";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

type RouteContext = { params: Promise<{ policyId: string }> };

export async function POST(request: Request, context: RouteContext) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'security.policies');
      const { policyId } = await context.params;
      const body = await parseJsonBody<unknown>(request);
      const result = await PolicyEngineService.testPolicy(ctx.tenant, policyId, body as any);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
