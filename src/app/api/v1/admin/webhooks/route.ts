import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { rbacService, RBACService } from "@/modules/rbac/rbac.service";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const createSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  secret: z.string().optional(),
  events: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
  
      await rbacService.ensurePermission(ctx.tenant.userId, String(ctx.tenant.companyId), "webhooks.manage");

      const { searchParams } = new URL(request.url);
      const take = Math.min(Math.max(Number(searchParams.get("take") ?? 200) || 200, 1), 500);
      const skip = Math.max(Number(searchParams.get("skip") ?? 0) || 0, 0);

      const hooks = await prisma.webhook.findMany({
        where: { companyId: ctx.tenant.companyId },
        take,
        skip,
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json(hooks);
    } catch (err) {
      if (err instanceof z.ZodError) return zodErrorResponse(err);
      return handleRouteError(err);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
  
      await rbacService.ensurePermission(ctx.tenant.userId, String(ctx.tenant.companyId), "webhooks.manage");
  
      const raw = await parseJsonBody<unknown>(request);
      const input = createSchema.parse(raw);
  
      const hook = await prisma.webhook.create({ data: { companyId: ctx.tenant.companyId, name: input.name, url: input.url, secret: input.secret, events: input.events ?? ["transaction.created"], active: input.active ?? true } });
      return NextResponse.json({ success: true, hook });
    } catch (err) {
      if (err instanceof z.ZodError) return zodErrorResponse(err);
      return handleRouteError(err);
    }
  });
}
