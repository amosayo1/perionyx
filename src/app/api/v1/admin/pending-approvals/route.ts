import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { requireTenantContext } from '@/server/context/tenant-context';
import { prisma } from '@/server/db/prisma';
import { handleRouteError } from '@/server/http/handle-route';
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'approvals.view');

    const pending = await prisma.transactionApproval.findMany({
      where: { companyId: ctx.companyId, status: 'PENDING' },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({ success: true, pending });
  } catch (err) {
    return handleRouteError(err);
  }
}

