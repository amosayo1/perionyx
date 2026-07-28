import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { MonitorService } from "@/modules/orchestration";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "orchestration.read");
      const item = await MonitorService.getExecutionById(ctx.tenant, id);
      if (!item) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Execution not found" } }, { status: 404 });
      return NextResponse.json(item);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "orchestration.write");
      const item = await MonitorService.retryExecution(ctx.tenant, id);
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
      await MonitorService.cancelExecution(ctx.tenant, id);
      return NextResponse.json({ cancelled: true });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
