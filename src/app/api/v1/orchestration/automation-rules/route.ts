import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { AutomationEngine } from "@/modules/orchestration";
import type { AutomationAction } from "@/modules/orchestration";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "orchestration.read");
      const items = await AutomationEngine.list(ctx.tenant);
      return NextResponse.json({ items });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "orchestration.write");
      const body = await parseJsonBody<{
        name: string; description?: string; eventType: string;
        condition?: Record<string, unknown>; actions: AutomationAction[]; priority?: number; cooldownSec?: number;
      }>(request);
      const item = await AutomationEngine.create(ctx.tenant, body);
      return NextResponse.json(item, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
