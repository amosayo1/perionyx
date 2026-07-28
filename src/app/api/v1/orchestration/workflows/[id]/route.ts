import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { OrchestrationService } from "@/modules/orchestration";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "orchestration.read");
      const item = await OrchestrationService.WorkflowBuilder.get(ctx.tenant, id);
      if (!item) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Workflow not found" } }, { status: 404 });
      return NextResponse.json(item);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "orchestration.write");
      const body = await parseJsonBody<Record<string, unknown>>(request);
      const item = await OrchestrationService.WorkflowBuilder.update(ctx.tenant, id, body);
      return NextResponse.json(item);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "orchestration.write");
      const body = await parseJsonBody<{ input?: Record<string, unknown> }>(request).catch(() => ({ input: undefined }));
      const result = await OrchestrationService.WorkflowEngine.execute(ctx.tenant, id, "manual", body.input);
      return NextResponse.json(result, { status: 202 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
