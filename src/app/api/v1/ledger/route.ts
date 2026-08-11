import { NextResponse } from "next/server";
import { listLedgerEntriesForTenant } from "@/modules/ledger";
import { decimalToString } from "@/server/http/money";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { parseCursorPagination } from "@/server/http/pagination";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'treasury.read');
      const { searchParams } = new URL(request.url);
      const { take, cursor } = parseCursorPagination(searchParams);
      const walletId = searchParams.get("walletId") ?? undefined;
  
      const { rows, nextCursor } = await listLedgerEntriesForTenant(ctx.tenant, {
        take,
        cursor,
        walletId,
      });
  
      return NextResponse.json({
        items: rows.map((e) => ({
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
          transaction: {
            ...e.transaction,
            createdAt: e.transaction.createdAt.toISOString(),
          },
        })),
        nextCursor,
      }, { headers: cacheHeaders(15) });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
