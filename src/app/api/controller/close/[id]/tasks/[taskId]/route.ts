import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { CloseManagementService } from "@/modules/controller-specialist/close-management";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
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

    const task = await CloseManagementService.updateCloseTask(ctx, taskId, input);
    return NextResponse.json(task);
  } catch (err) {
    return handleRouteError(err, req);
  }
}
