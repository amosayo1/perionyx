import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { getQueueStats, isQueueRunning } from "@/modules/queue/queue.service";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'admin.settings');
    const running = isQueueRunning();
    const stats = await getQueueStats();
    return NextResponse.json({ running, ...(stats ?? { queues: [] }) });
  } catch (error) {
    return handleRouteError(error);
  }
}
