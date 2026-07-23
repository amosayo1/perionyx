import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { cacheHeaders, handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { PolicyEngineService } from "@/modules/policies";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'security.policies');
    const { searchParams } = new URL(request.url);
    const includeDisabled = searchParams.get("includeDisabled") === "true" ? true : searchParams.get("includeDisabled") === "false" ? false : undefined;
    const result = await PolicyEngineService.listPolicies(ctx, includeDisabled);
    return NextResponse.json(result, { headers: { ...cacheHeaders(30) } });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await parseJsonBody<unknown>(request);
    const result = await PolicyEngineService.createPolicy(ctx, body as any);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
