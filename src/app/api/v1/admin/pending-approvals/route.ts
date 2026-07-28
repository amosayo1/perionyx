import { NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
import { handleRouteError } from '@/server/http/handle-route';
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'approvals.view');
  
      const pending = await prisma.transactionApproval.findMany({
        where: { companyId: ctx.tenant.companyId, status: 'PENDING' },
        include: { transaction: true },
        orderBy: { createdAt: 'desc' },
        take: 200,
      });
  
      return NextResponse.json({ success: true, pending });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}

