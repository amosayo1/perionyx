import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { requireTenantContext } from '@/server/context/tenant-context';
import { rbacService, RBACService } from '@/modules/rbac/rbac.service';
import { handleRouteError } from '@/server/http/handle-route';
import { prisma } from '@/server/db/prisma';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'admin.manage_users');

    const body = await request.json();
    const { roleId } = body;

    if (!roleId) {
      return NextResponse.json({ error: 'Role ID required' }, { status: 400 });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Assign role
    const assignment = await rbacService.assignRoleToUser(userId, roleId, ctx.companyId);

    // Log audit
    await prisma.auditLog.create({
      data: {
        companyId: ctx.companyId,
        actorUserId: ctx.userId,
        action: 'USER_ROLE_ASSIGNED',
        resourceType: 'User',
        resourceId: userId,
        severity: 'INFO',
        metadata: { roleId },
      },
    });

    return NextResponse.json({ success: true, assignment });
  } catch (err) {
    return handleRouteError(err);
  }
}

