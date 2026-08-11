import { z } from "zod";
import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { WebhookService } from "@/modules/webhooks";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const createWebhookSchema = z.object({
  name: z.string().min(1).max(200),
  url: z.string().url(),
  events: z.array(z.string().min(1).max(100)).max(50).default([]),
  secret: z.string().min(8).max(256).optional(),
});

const updateWebhookSchema = z.object({
  id: z.string().min(1).max(128),
  name: z.string().min(1).max(200).optional(),
  url: z.string().url().optional(),
  events: z.array(z.string().min(1).max(100)).max(50).optional(),
  secret: z.string().min(8).max(256).optional(),
  active: z.boolean().optional(),
});

const deleteWebhookSchema = z.object({
  id: z.string().min(1).max(128),
});

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
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.webhooks');
      const raw = await parseJsonBody<unknown>(request);
      const body = createWebhookSchema.parse(raw);
      const wh = await WebhookService.create(ctx.tenant, body);
      return NextResponse.json(wh, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) return zodErrorResponse(error);
      return handleRouteError(error);
    }
  });
}

export async function PATCH(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.webhooks');
      const raw = await parseJsonBody<unknown>(request);
      const body = updateWebhookSchema.parse(raw);
      const wh = await WebhookService.update(ctx.tenant, body.id, body);
      return NextResponse.json(wh);
    } catch (error) {
      if (error instanceof z.ZodError) return zodErrorResponse(error);
      return handleRouteError(error);
    }
  });
}

export async function DELETE(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.webhooks');
      const raw = await parseJsonBody<unknown>(request);
      const body = deleteWebhookSchema.parse(raw);
      const result = await WebhookService.delete(ctx.tenant, body.id);
      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) return zodErrorResponse(error);
      return handleRouteError(error);
    }
  });
}
