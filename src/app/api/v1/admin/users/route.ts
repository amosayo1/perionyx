import { NextResponse } from 'next/server';
import { rbacService, RBACService } from '@/modules/rbac/rbac.service';
import { handleRouteError } from '@/server/http/handle-route';
import { prisma } from '@/server/db/prisma';
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
  
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.manage_users');
  
      const memberships = await prisma.companyMembership.findMany({
        where: { companyId: ctx.tenant.companyId },
        include: {
          user: {
            include: {
              userRoles: {
                where: { companyId: ctx.tenant.companyId },
                include: { role: true },
              },
            },
          },
        },
      });
  
      return NextResponse.json({ success: true, memberships });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}

