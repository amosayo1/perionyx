import { NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
import { handleRouteError, cacheHeaders } from '@/server/http/handle-route';
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'approvals.view');
  
      const pending = await prisma.transactionApproval.findMany({
        where: { companyId: ctx.tenant.companyId, status: 'PENDING' },
        select: {
          id: true,
          transactionId: true,
          status: true,
          createdAt: true,
          transaction: { select: { primaryAmount: true, currency: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
  
      return NextResponse.json({ success: true, pending }, { headers: cacheHeaders(10) });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}

