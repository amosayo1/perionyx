import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { OrchestrationService, MonitorService } from "@/modules/orchestration";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "orchestration.read");
    const [summary, running, failed] = await Promise.all([
      OrchestrationService.getMonitoringSummary(ctx),
      MonitorService.getRunningExecutions(ctx),
      MonitorService.getFailedExecutions(ctx),
    ]);
    return NextResponse.json({ summary, running, failed });
  } catch (error) {
    return handleRouteError(error);
  }
}
