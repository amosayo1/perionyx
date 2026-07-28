import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { getQueueStats, isQueueRunning } from "@/modules/queue/queue.service";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.settings');
      const running = isQueueRunning();
      const stats = await getQueueStats();
      return NextResponse.json({ running, ...(stats ?? { queues: [] }) });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
