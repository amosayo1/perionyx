import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { notificationService, NotificationService } from "@/modules/notifications";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const channels = await notificationService.getChannels(ctx);
    return NextResponse.json({ items: channels });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await parseJsonBody<{ type: string; name: string; config: Record<string, any>; isActive?: boolean }>(request);
    const channel = await notificationService.createChannel(ctx, body);
    return NextResponse.json(channel, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await parseJsonBody<{ id: string; name?: string; config?: Record<string, any>; isActive?: boolean }>(request);
    const channel = await notificationService.updateChannel(ctx, body.id, body);
    return NextResponse.json(channel);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await parseJsonBody<{ id: string }>(request);
    const result = await notificationService.deleteChannel(ctx, body.id);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
