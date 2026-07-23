import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { OrchestrationService } from "@/modules/orchestration";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "orchestration.read");
    const item = await OrchestrationService.WorkflowBuilder.get(ctx, id);
    if (!item) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Workflow not found" } }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "orchestration.write");
    const body = await parseJsonBody<Record<string, unknown>>(request);
    const item = await OrchestrationService.WorkflowBuilder.update(ctx, id, body);
    return NextResponse.json(item);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "orchestration.write");
    const body = await parseJsonBody<{ input?: Record<string, unknown> }>(request).catch(() => ({ input: undefined }));
    const result = await OrchestrationService.WorkflowEngine.execute(ctx, id, "manual", body.input);
    return NextResponse.json(result, { status: 202 });
  } catch (error) {
    return handleRouteError(error);
  }
}
