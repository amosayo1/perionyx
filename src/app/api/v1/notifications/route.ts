import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { notificationService, NotificationService } from "@/modules/notifications";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 50;
    const cursor = searchParams.get("cursor") || undefined;
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const countOnly = searchParams.get("count") === "true";

    if (countOnly) {
      const result = await notificationService.getUnreadCount(ctx);
      return NextResponse.json(result);
    }

    const result = await notificationService.list(ctx, { limit, cursor, unreadOnly });
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await request.json().catch(() => ({}));

    if ("all" in body && body.all === true) {
      const result = await notificationService.markAllRead(ctx);
      return NextResponse.json(result);
    }

    const { ids } = body as { ids: string[] };
    if (!ids?.length) return NextResponse.json({ error: "No ids provided" }, { status: 400 });
    const result = await notificationService.markRead(ctx, ids);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
