import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { OrchestrationService } from "@/modules/orchestration";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "orchestration.write");
    const body = await parseJsonBody<{ eventType: string; source?: string; payload?: Record<string, unknown> }>(request);
    await OrchestrationService.emitEvent(ctx, body.eventType, body.source ?? "api", body.payload);
    return NextResponse.json({ emitted: true, eventType: body.eventType }, { status: 202 });
  } catch (error) {
    return handleRouteError(error);
  }
}
