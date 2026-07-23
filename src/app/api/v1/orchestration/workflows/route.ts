import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { OrchestrationService } from "@/modules/orchestration";
import type { WorkflowStep } from "@/modules/orchestration";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "orchestration.read");
    const category = request.nextUrl.searchParams.get("category") ?? undefined;
    const items = await OrchestrationService.WorkflowBuilder.list(ctx, category);
    return NextResponse.json({ items });
  } catch (error) {
    return handleRouteError(error, request);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "orchestration.write");
    const body = await parseJsonBody<{ name: string; description?: string; category?: string; steps: WorkflowStep[] }>(request);
    const item = await OrchestrationService.WorkflowBuilder.create(ctx, body);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return handleRouteError(error, request);
  }
}
