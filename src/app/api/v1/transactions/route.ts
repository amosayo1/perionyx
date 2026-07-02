import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { listTransactionsForTenant } from "@/modules/transactions";
import { decimalToString } from "@/server/http/money";
import { handleRouteError } from "@/server/http/handle-route";
import { parseCursorPagination } from "@/server/http/pagination";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole,
    );
    const { searchParams } = new URL(request.url);
    const { take, cursor } = parseCursorPagination(searchParams);
    const { rows, nextCursor } = await listTransactionsForTenant(ctx, { take, cursor });

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
}
