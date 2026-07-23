import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { rbacService, RBACService } from "@/modules/rbac/rbac.service";
import { prisma } from "@/server/db/prisma";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'admin.roles');

    let permissions = await rbacService.getUserPermissions(ctx.userId, ctx.companyId);

    // Fallback: if no RBAC roles, use CompanyRole from membership
    if (permissions.length === 0) {
      const membership = await prisma.companyMembership.findFirst({
        where: { userId: ctx.userId, companyId: ctx.companyId },
      });
      return NextResponse.json({
        permissions: [],
        fallbackRole: membership?.role ?? "MEMBER",
        hasRbac: false,
      });
    }

    return NextResponse.json({
      permissions,
      fallbackRole: null,
      hasRbac: true,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
