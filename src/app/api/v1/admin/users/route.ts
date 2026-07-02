import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { requireTenantContext } from '@/server/context/tenant-context';
import { rbacService, RBACService } from '@/modules/rbac/rbac.service';
import { handleRouteError } from '@/server/http/handle-route';
import { prisma } from '@/server/db/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'admin.manage_users');

    const memberships = await prisma.companyMembership.findMany({
      where: { companyId: ctx.companyId },
      include: {
        user: {
          include: {
            userRoles: {
              where: { companyId: ctx.companyId },
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
}

