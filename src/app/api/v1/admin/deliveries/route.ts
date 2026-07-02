import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/server/auth/auth';
import { requireTenantContext } from '@/server/context/tenant-context';
import { prisma } from '@/server/db/prisma';
import { rbacService, RBACService } from '@/modules/rbac/rbac.service';
import { handleRouteError } from '@/server/http/handle-route';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(session?.user?.id, String(ctx.companyId), 'webhooks.manage');
    const deliveries = await prisma.webhookDelivery.findMany({ where: { companyId: ctx.companyId }, include: { webhook: true }, orderBy: { createdAt: 'desc' }, take: 200 });
    return NextResponse.json({ deliveries });
  } catch (err) {
    return handleRouteError(err);
  }
}
