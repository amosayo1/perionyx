import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { OrchestrationService } from "@/modules/orchestration";
import type { WorkflowStep } from "@/modules/orchestration";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "orchestration.read");
      const category = request.nextUrl.searchParams.get("category") ?? undefined;
      const items = await OrchestrationService.WorkflowBuilder.list(ctx.tenant, category);
      return NextResponse.json({ items });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "orchestration.write");
      const body = await parseJsonBody<{ name: string; description?: string; category?: string; steps: WorkflowStep[] }>(request);
      const item = await OrchestrationService.WorkflowBuilder.create(ctx.tenant, body);
      return NextResponse.json(item, { status: 201 });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}
