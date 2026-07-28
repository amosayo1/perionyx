import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { OrchestrationService, MonitorService } from "@/modules/orchestration";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "orchestration.read");
      const [summary, running, failed] = await Promise.all([
        OrchestrationService.getMonitoringSummary(ctx.tenant),
        MonitorService.getRunningExecutions(ctx.tenant),
        MonitorService.getFailedExecutions(ctx.tenant),
      ]);
      return NextResponse.json({ summary, running, failed });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
