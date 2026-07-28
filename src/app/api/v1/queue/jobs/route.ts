import { z } from "zod";
import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { getJobStatus, getQueueStats, cancelJob, isQueueRunning } from "@/modules/queue/queue.service";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const CancelJobSchema = z.object({
  action: z.literal("cancel"),
  queueName: z.string().min(1, "queueName is required").max(128),
  jobId: z.string().min(1, "jobId is required").max(128),
});

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.settings');
  
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
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const rawBody = await request.json();
      const parsed = CancelJobSchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: "VALIDATION", message: parsed.error.issues[0].message } },
          { status: 400 },
        );
      }
      const { queueName, jobId } = parsed.data;
      const ok = await cancelJob(queueName, jobId);
      return NextResponse.json({ success: ok });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
