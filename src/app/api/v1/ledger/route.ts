import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { listLedgerEntriesForTenant } from "@/modules/ledger";
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
    const walletId = searchParams.get("walletId") ?? undefined;

    const { rows, nextCursor } = await listLedgerEntriesForTenant(ctx, {
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
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
