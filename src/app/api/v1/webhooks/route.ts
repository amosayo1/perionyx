import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { WebhookService } from "@/modules/webhooks";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const webhooks = await WebhookService.list(ctx);
    return NextResponse.json({ items: webhooks });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await parseJsonBody<{ name: string; url: string; events: string[]; secret?: string }>(request);
    const wh = await WebhookService.create(ctx, body);
    return NextResponse.json(wh, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await parseJsonBody<{ id: string; name?: string; url?: string; events?: string[]; secret?: string; active?: boolean }>(request);
    const wh = await WebhookService.update(ctx, body.id, body);
    return NextResponse.json(wh);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await parseJsonBody<{ id: string }>(request);
    const result = await WebhookService.delete(ctx, body.id);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}


