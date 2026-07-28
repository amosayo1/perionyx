import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { OrchestrationService } from "@/modules/orchestration";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "orchestration.read");
      const workflowId = request.nextUrl.searchParams.get("workflowId") ?? undefined;
      const status = request.nextUrl.searchParams.get("status") ?? undefined;
      const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "50", 10);
      const items = await OrchestrationService.WorkflowEngine.listExecutions(ctx.tenant, { workflowId, status: status as never, limit });
      return NextResponse.json({ items });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}
