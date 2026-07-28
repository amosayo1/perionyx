import { NextResponse } from "next/server";
import { listTransactionsForTenant } from "@/modules/transactions";
import { decimalToString } from "@/server/http/money";
import { handleRouteError } from "@/server/http/handle-route";
import { parseCursorPagination } from "@/server/http/pagination";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'treasury.read');
      const { searchParams } = new URL(request.url);
      const { take, cursor } = parseCursorPagination(searchParams);
      const { rows, nextCursor } = await listTransactionsForTenant(ctx.tenant, { take, cursor });
  
      return NextResponse.json({
        items: rows.map((t) => ({
          id: t.id,
          companyId: t.companyId,
          type: t.type,
          status: t.status,
          primaryAmount: decimalToString(t.primaryAmount),
          currency: t.currency,
          reference: t.reference,
          idempotencyKey: t.idempotencyKey,
          metadata: t.metadata,
          createdByUserId: t.createdByUserId,
          createdAt: t.createdAt.toISOString(),
          ledgerEntryCount: t._count.ledgerEntries,
        })),
        nextCursor,
      });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
