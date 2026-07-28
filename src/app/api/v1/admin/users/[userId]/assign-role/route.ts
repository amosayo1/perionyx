import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rbacService, RBACService } from '@/modules/rbac/rbac.service';
import { handleRouteError } from '@/server/http/handle-route';
import { prisma } from '@/server/db/prisma';
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const AssignRoleBodySchema = z.object({
  roleId: z.string().min(1, "roleId is required").max(128),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { userId } = await context.params;
  
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.manage_users');
  
      const body = await request.json();
      const parsed = AssignRoleBodySchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: { code: "VALIDATION", message: parsed.error.issues[0].message } }, { status: 400 });
      }
      const { roleId } = parsed.data;
  
      // Verify user exists
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
  
      // Assign role
      const assignment = await rbacService.assignRoleToUser(userId, roleId, ctx.tenant.companyId);
  
      // Log audit
      await prisma.auditLog.create({
        data: {
          companyId: ctx.tenant.companyId,
          actorUserId: ctx.tenant.userId,
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
  });
}

