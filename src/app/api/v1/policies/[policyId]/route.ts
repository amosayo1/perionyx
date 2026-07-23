import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { PolicyEngineService } from "@/modules/policies";
import { rbacService } from "@/modules/rbac/rbac.service";

type RouteContext = { params: Promise<{ policyId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'security.policies');
    const { policyId } = await context.params;
    const result = await PolicyEngineService.getPolicy(ctx, policyId);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { policyId } = await context.params;
    const body = await parseJsonBody<unknown>(request);
    const result = await PolicyEngineService.updatePolicy(ctx, policyId, body as any);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { policyId } = await context.params;
    const result = await PolicyEngineService.deletePolicy(ctx, policyId);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
