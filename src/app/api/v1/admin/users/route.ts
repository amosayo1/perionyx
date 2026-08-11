import { NextResponse } from 'next/server';
import { rbacService, RBACService } from '@/modules/rbac/rbac.service';
import { handleRouteError } from '@/server/http/handle-route';
import { prisma } from '@/server/db/prisma';
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
  
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.manage_users');

      const { searchParams } = new URL(request.url);
      const take = Math.min(Math.max(Number(searchParams.get("take") ?? 500) || 500, 1), 1000);
      const skip = Math.max(Number(searchParams.get("skip") ?? 0) || 0, 0);
  
      const memberships = await prisma.companyMembership.findMany({
        where: { companyId: ctx.tenant.companyId },
        take,
        skip,
        orderBy: { createdAt: "asc" },
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
  
      const total = await prisma.companyMembership.count({
        where: { companyId: ctx.tenant.companyId },
      });
  
      return NextResponse.json({ success: true, memberships, total });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}

