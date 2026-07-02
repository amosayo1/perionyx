import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { NotFoundError } from "@/lib/errors/app-error";

export type ListLedgerEntriesOptions = {
  take: number;
  cursor?: string;
  walletId?: string;
};

export async function listLedgerEntriesForTenant(
  ctx: TenantContext,
  opts: ListLedgerEntriesOptions,
) {
  const rows = await prisma.ledgerEntry.findMany({
    where: {
      companyId: ctx.companyId,
      ...(opts.walletId ? { walletId: opts.walletId } : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: opts.take + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    include: {
      wallet: { select: { id: true, name: true, kind: true, currency: true } },
      transaction: {
        select: { id: true, type: true, status: true, reference: true, createdAt: true },
      },
    },
  });

  let nextCursor: string | undefined;
  if (rows.length > opts.take) {
    rows.pop();
    nextCursor = rows[rows.length - 1]?.id;
  }

  return { rows, nextCursor };
}

export async function getLedgerForTransactionForTenant(
  ctx: TenantContext,
  transactionId: string,
) {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, companyId: ctx.companyId },
  });
  if (!transaction) {
    throw new NotFoundError("Transaction");
  }

  const entries = await prisma.ledgerEntry.findMany({
    where: { companyId: ctx.companyId, transactionId },
    orderBy: { sequence: "asc" },
    include: {
      wallet: {
        select: { id: true, name: true, kind: true, currency: true, companyId: true },
      },
    },
  });

  return { transaction, entries };
}
