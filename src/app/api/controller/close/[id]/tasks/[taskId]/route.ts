import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { CloseManagementService } from "@/modules/controller-specialist/close-management";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { taskId } = await params;
  
      const body = await parseJsonBody<{
        status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED" | "OVERDUE" | "SKIPPED";
        assignedTo?: string;
        blockedReason?: string;
        completedAt?: string;
        metadata?: Record<string, unknown>;
      }>(req);
  
      const input = {
        ...body,
        completedAt: body.completedAt ? new Date(body.completedAt) : undefined,
      };
  
      const task = await CloseManagementService.updateCloseTask(ctx.tenant, taskId, input);
      return NextResponse.json(task);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
