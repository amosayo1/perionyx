import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db/prisma';
import { rbacService, RBACService } from '@/modules/rbac/rbac.service';
import { handleRouteError } from '@/server/http/handle-route';
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, String(ctx.tenant.companyId), 'webhooks.manage');
      const deliveries = await prisma.webhookDelivery.findMany({ where: { companyId: ctx.tenant.companyId }, include: { webhook: true }, orderBy: { createdAt: 'desc' }, take: 200 });
      return NextResponse.json({ deliveries });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}
