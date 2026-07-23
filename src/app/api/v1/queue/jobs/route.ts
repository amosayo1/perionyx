import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { getJobStatus, getQueueStats, cancelJob, isQueueRunning } from "@/modules/queue/queue.service";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'admin.settings');

    const url = new URL(request.url);
    const jobId = url.searchParams.get("id");
    const queueName = url.searchParams.get("name");

    if (jobId && queueName) {
      const job = await getJobStatus(queueName, jobId);
      if (!job) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "Job not found" } },
          { status: 404 },
        );
      }
      return NextResponse.json({ job });
    }

    const running = isQueueRunning();
    const stats = await getQueueStats();
    return NextResponse.json({ running, ...(stats ?? { queues: [] }) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const body = await request.json() as { action: string; queueName: string; jobId: string };
    const { action, queueName, jobId } = body;

    if (action === "cancel" && queueName && jobId) {
      const ok = await cancelJob(queueName, jobId);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json(
      { error: { code: "VALIDATION", message: "Invalid action. Use: { action: 'cancel', queueName, jobId }" } },
      { status: 400 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
