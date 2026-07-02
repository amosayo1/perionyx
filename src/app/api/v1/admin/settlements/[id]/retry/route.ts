import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { requireTenantContext } from '@/server/context/tenant-context';
import { prisma } from '@/server/db/prisma';
import { rbacService, RBACService } from '@/modules/rbac/rbac.service';
import { ConnectorsManager } from '@/modules/integrations/connectors/manager';
import { handleRouteError } from '@/server/http/handle-route';

export async function POST(request: Request, context: any) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(session?.user?.id, String(ctx.companyId), 'connectors.manage');
    const { params } = context;
    const id = params.id;
    const rec = await prisma.settlementRecord.findUnique({ where: { id } });
    if (!rec || rec.companyId !== ctx.companyId) throw new Error('Not found');
    // find corresponding connector config
    const cfg = await prisma.connectorConfig.findFirst({ where: { companyId: ctx.companyId, name: rec.connectorName } });
    if (!cfg) throw new Error('Connector config not found');
    // fetch transaction if any
    const txn = rec.transactionId ? await prisma.transaction.findUnique({ where: { id: rec.transactionId } }) : null;
    await ConnectorsManager.settle(ctx.companyId, txn ?? { id: rec.transactionId });
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
