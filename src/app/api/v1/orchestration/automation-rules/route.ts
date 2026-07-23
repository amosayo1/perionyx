import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { AutomationEngine } from "@/modules/orchestration";
import type { AutomationAction } from "@/modules/orchestration";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "orchestration.read");
    const items = await AutomationEngine.list(ctx);
    return NextResponse.json({ items });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "orchestration.write");
    const body = await parseJsonBody<{
      name: string; description?: string; eventType: string;
      condition?: Record<string, unknown>; actions: AutomationAction[]; priority?: number; cooldownSec?: number;
    }>(request);
    const item = await AutomationEngine.create(ctx, body);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
