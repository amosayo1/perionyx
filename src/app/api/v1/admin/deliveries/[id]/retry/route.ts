import { NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
import { rbacService, RBACService } from '@/modules/rbac/rbac.service';
import { handleRouteError } from '@/server/http/handle-route';
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(request: Request, context: any) {
  return withRuntimeContext(request, async (ctx) => {
    const { params } = context;
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, String(ctx.tenant.companyId), 'webhooks.manage');
      const id = params.id;
      await prisma.webhookDelivery.updateMany({ where: { id, companyId: ctx.tenant.companyId }, data: { status: 'PENDING', nextAttemptAt: null, lastError: null, attempts: 0 } });
      return NextResponse.json({ success: true });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}
