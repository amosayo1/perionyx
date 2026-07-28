import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { WebhookService } from "@/modules/webhooks";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.webhooks');
      const webhooks = await WebhookService.list(ctx.tenant);
      return NextResponse.json({ items: webhooks });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await parseJsonBody<{ name: string; url: string; events: string[]; secret?: string }>(request);
      const wh = await WebhookService.create(ctx.tenant, body);
      return NextResponse.json(wh, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function PATCH(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await parseJsonBody<{ id: string; name?: string; url?: string; events?: string[]; secret?: string; active?: boolean }>(request);
      const wh = await WebhookService.update(ctx.tenant, body.id, body);
      return NextResponse.json(wh);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function DELETE(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await parseJsonBody<{ id: string }>(request);
      const result = await WebhookService.delete(ctx.tenant, body.id);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}


