import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { rbacService, RBACService } from "@/modules/rbac/rbac.service";
import { createInvite, listInvites } from "@/modules/invites";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const createInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["OWNER", "ADMIN", "TREASURER", "MEMBER", "VIEWER"]),
});

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "admin.manage_users");
      const invites = await listInvites(ctx.tenant.companyId);
      return NextResponse.json({ invites });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "admin.manage_users");
      const raw = await parseJsonBody<unknown>(request);
      const body = createInviteSchema.parse(raw);
      const invite = await createInvite({
        companyId: ctx.tenant.companyId,
        email: body.email,
        role: body.role,
        invitedByUserId: ctx.tenant.userId,
      });
      return NextResponse.json({ success: true, invite }, { status: 201 });
    } catch (err) {
      if (err instanceof z.ZodError) return zodErrorResponse(err);
      return handleRouteError(err);
    }
  });
}
