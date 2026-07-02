import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { prisma } from "@/server/db/prisma";
import { rbacService, RBACService } from "@/modules/rbac/rbac.service";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";

const createSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  secret: z.string().optional(),
  events: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    await rbacService.ensurePermission(session?.user?.id, String(ctx.companyId), "webhooks.manage");

    const hooks = await prisma.webhook.findMany({ where: { companyId: ctx.companyId } });
    return NextResponse.json(hooks);
  } catch (err) {
    if (err instanceof z.ZodError) return zodErrorResponse(err);
    return handleRouteError(err);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    await rbacService.ensurePermission(session?.user?.id, String(ctx.companyId), "webhooks.manage");

    const raw = await parseJsonBody<unknown>(request);
    const input = createSchema.parse(raw);

    const hook = await prisma.webhook.create({ data: { companyId: ctx.companyId, name: input.name, url: input.url, secret: input.secret, events: input.events ?? ["transaction.created"], active: input.active ?? true } });
    return NextResponse.json({ success: true, hook });
  } catch (err) {
    if (err instanceof z.ZodError) return zodErrorResponse(err);
    return handleRouteError(err);
  }
}
