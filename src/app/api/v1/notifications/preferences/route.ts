import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { notificationService, NotificationService } from "@/modules/notifications";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.settings');
      const prefs = await notificationService.getPreferences(ctx.tenant);
      return NextResponse.json({ items: prefs });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const result = await notificationService.setupDefaultPreferences(ctx.tenant);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function PATCH(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await parseJsonBody<{ id: string; enabled: boolean }>(request);
      const result = await notificationService.updatePreference(ctx.tenant, body.id, body.enabled);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
