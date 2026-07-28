import { NextResponse } from "next/server";
import { getLedgerForTransactionForTenant } from "@/modules/ledger";
import { decimalToString } from "@/server/http/money";
import { handleRouteError } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

type RouteContext = { params: Promise<{ transactionId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'treasury.read');
      const { transactionId } = await context.params;
      const { transaction, entries } = await getLedgerForTransactionForTenant(
        ctx.tenant,
        transactionId,
      );
  
      return NextResponse.json({
        transaction: {
          id: transaction.id,
          companyId: transaction.companyId,
          type: transaction.type,
          status: transaction.status,
          primaryAmount: decimalToString(transaction.primaryAmount),
          currency: transaction.currency,
          reference: transaction.reference,
          idempotencyKey: transaction.idempotencyKey,
          metadata: transaction.metadata,
          createdByUserId: transaction.createdByUserId,
          createdAt: transaction.createdAt.toISOString(),
        },
        ledgerEntries: entries.map((e) => ({
          id: e.id,
          companyId: e.companyId,
          transactionId: e.transactionId,
          walletId: e.walletId,
          side: e.side,
          amount: decimalToString(e.amount),
          currency: e.currency,
          sequence: e.sequence,
          createdAt: e.createdAt.toISOString(),
          wallet: e.wallet,
        })),
      });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
