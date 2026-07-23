import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { OrchestrationService } from "@/modules/orchestration";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "orchestration.read");
    const workflowId = request.nextUrl.searchParams.get("workflowId") ?? undefined;
    const status = request.nextUrl.searchParams.get("status") ?? undefined;
    const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "50", 10);
    const items = await OrchestrationService.WorkflowEngine.listExecutions(ctx, { workflowId, status: status as never, limit });
    return NextResponse.json({ items });
  } catch (error) {
    return handleRouteError(error, request);
  }
}
