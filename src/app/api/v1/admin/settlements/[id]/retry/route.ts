import { NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
import { rbacService, RBACService } from '@/modules/rbac/rbac.service';
import { ConnectorsManager } from '@/modules/integrations/connectors/manager';
import { handleRouteError } from '@/server/http/handle-route';
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(request: Request, context: any) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, String(ctx.tenant.companyId), 'connectors.manage');
      const { params } = context;
      const id = params.id;
      const rec = await prisma.settlementRecord.findUnique({ where: { id } });
      if (!rec || rec.companyId !== ctx.tenant.companyId) throw new Error('Not found');
      // find corresponding connector config
      const cfg = await prisma.connectorConfig.findFirst({ where: { companyId: ctx.tenant.companyId, name: rec.connectorName } });
      if (!cfg) throw new Error('Connector config not found');
      // fetch transaction if any
      const txn = rec.transactionId ? await prisma.transaction.findUnique({ where: { id: rec.transactionId } }) : null;
      await ConnectorsManager.settle(ctx.tenant.companyId, txn ?? { id: rec.transactionId });
      return NextResponse.json({ success: true });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}
