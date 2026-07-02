import type { LedgerEntry, Transaction } from "@prisma/client";
import { decimalToString } from "@/server/http/money";

export function serializeTransactionWithLedger(txn: Transaction & { ledgerEntries: LedgerEntry[] }) {
  return {
    id: txn.id,
    companyId: txn.companyId,
    type: txn.type,
    status: txn.status,
    primaryAmount: decimalToString(txn.primaryAmount),
    currency: txn.currency,
    reference: txn.reference,
    idempotencyKey: txn.idempotencyKey,
    metadata: txn.metadata,
    createdByUserId: txn.createdByUserId,
    createdAt: txn.createdAt.toISOString(),
    ledgerEntries: txn.ledgerEntries.map((e) => ({
      id: e.id,
      walletId: e.walletId,
      side: e.side,
      amount: decimalToString(e.amount),
      currency: e.currency,
      sequence: e.sequence,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}
