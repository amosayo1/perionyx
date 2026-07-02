import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { prisma } from "@/server/db/prisma";
import { rbacService, RBACService } from "@/modules/rbac/rbac.service";
import { createInvite, listInvites } from "@/modules/invites";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";

const createInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["OWNER", "ADMIN", "TREASURER", "MEMBER", "VIEWER"]),
});

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "admin.manage_users");
    const invites = await listInvites(ctx.companyId);
    return NextResponse.json({ invites });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "admin.manage_users");
    const raw = await parseJsonBody<unknown>(request);
    const body = createInviteSchema.parse(raw);
    const invite = await createInvite({
      companyId: ctx.companyId,
      email: body.email,
      role: body.role,
      invitedByUserId: ctx.userId,
    });
    return NextResponse.json({ success: true, invite }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return zodErrorResponse(err);
    return handleRouteError(err);
  }
}
