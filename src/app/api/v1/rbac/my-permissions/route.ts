import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { rbacService, RBACService } from "@/modules/rbac/rbac.service";
import { prisma } from "@/server/db/prisma";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.roles');
  
      let permissions = await rbacService.getUserPermissions(ctx.tenant.userId, ctx.tenant.companyId);
  
      // Fallback: if no RBAC roles, use CompanyRole from membership
      if (permissions.length === 0) {
        const membership = await prisma.companyMembership.findFirst({
          where: { userId: ctx.tenant.userId, companyId: ctx.tenant.companyId },
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
  });
}
