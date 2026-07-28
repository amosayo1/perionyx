import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { SchedulerService } from "@/modules/orchestration";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "orchestration.write");
      const body = await parseJsonBody<Record<string, unknown>>(request);
      const item = await SchedulerService.update(ctx.tenant, id, body);
      return NextResponse.json(item);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "orchestration.write");
      await SchedulerService.delete(ctx.tenant, id);
      return NextResponse.json({ deleted: true });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
