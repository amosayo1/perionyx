import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { ReconciliationService } from "@/modules/reconciliation";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'reconciliation.view');
    const { searchParams } = new URL(request.url);
    const resolved = searchParams.get("resolved") === "true" ? true : searchParams.get("resolved") === "false" ? false : undefined;
    const severity = searchParams.get("severity") ?? undefined;
    const result = await ReconciliationService.listExceptions(ctx, { resolved, severity });
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await parseJsonBody<{ exceptionId: string }>(request);
    const result = await ReconciliationService.resolveException(ctx, body.exceptionId);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
