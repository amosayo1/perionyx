import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { requireTenantContext } from '@/server/context/tenant-context';
import { prisma } from '@/server/db/prisma';
import { rbacService, RBACService } from '@/modules/rbac/rbac.service';
import { handleRouteError } from '@/server/http/handle-route';

export async function POST(request: Request, context: any) {
  const { params } = context;
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(session?.user?.id, String(ctx.companyId), 'webhooks.manage');
    const id = params.id;
    await prisma.webhookDelivery.updateMany({ where: { id, companyId: ctx.companyId }, data: { status: 'PENDING', nextAttemptAt: null, lastError: null, attempts: 0 } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
