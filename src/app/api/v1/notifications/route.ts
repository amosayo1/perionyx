import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { notificationService, NotificationService } from "@/modules/notifications";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const MarkReadSchema = z.union([
  z.object({ all: z.literal(true) }),
  z.object({ ids: z.array(z.string().min(1).max(128)).min(1, "At least one id is required") }),
]);

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.settings');
      const { searchParams } = new URL(request.url);
      const limit = Number(searchParams.get("limit")) || 50;
      const cursor = searchParams.get("cursor") || undefined;
      const unreadOnly = searchParams.get("unreadOnly") === "true";
      const countOnly = searchParams.get("count") === "true";
  
      if (countOnly) {
        const result = await notificationService.getUnreadCount(ctx.tenant);
        return NextResponse.json(result, { headers: { ...cacheHeaders(15) } });
      }
  
      const result = await notificationService.list(ctx.tenant, { limit, cursor, unreadOnly });
      return NextResponse.json(result, { headers: { ...cacheHeaders(15) } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function PATCH(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const rawBody = await request.json().catch(() => ({}));
      const parsed = MarkReadSchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json({ error: { code: "VALIDATION", message: parsed.error.issues[0].message } }, { status: 400 });
      }
      const body = parsed.data;
  
      if ("all" in body) {
        const result = await notificationService.markAllRead(ctx.tenant);
        return NextResponse.json(result);
      }
  
      const result = await notificationService.markRead(ctx.tenant, body.ids);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
