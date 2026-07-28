import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { PolicyEngineService } from "@/modules/policies";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

type RouteContext = { params: Promise<{ policyId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'security.policies');
      const { policyId } = await context.params;
      const result = await PolicyEngineService.getPolicy(ctx.tenant, policyId);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function PUT(request: Request, context: RouteContext) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { policyId } = await context.params;
      const body = await parseJsonBody<unknown>(request);
      const result = await PolicyEngineService.updatePolicy(ctx.tenant, policyId, body as any);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      const { policyId } = await context.params;
      const result = await PolicyEngineService.deletePolicy(ctx.tenant, policyId);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
