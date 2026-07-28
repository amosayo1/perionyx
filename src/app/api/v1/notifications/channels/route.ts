import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { notificationService, NotificationService } from "@/modules/notifications";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.settings');
      const channels = await notificationService.getChannels(ctx.tenant);
      return NextResponse.json({ items: channels });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await parseJsonBody<{ type: string; name: string; config: Record<string, any>; isActive?: boolean }>(request);
      const channel = await notificationService.createChannel(ctx.tenant, body);
      return NextResponse.json(channel, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function PATCH(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await parseJsonBody<{ id: string; name?: string; config?: Record<string, any>; isActive?: boolean }>(request);
      const channel = await notificationService.updateChannel(ctx.tenant, body.id, body);
      return NextResponse.json(channel);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function DELETE(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await parseJsonBody<{ id: string }>(request);
      const result = await notificationService.deleteChannel(ctx.tenant, body.id);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
