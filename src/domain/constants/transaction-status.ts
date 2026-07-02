import { TransactionStatus } from "@prisma/client";

export type { TransactionStatus } from "@prisma/client";

export const TransactionStatusCode = {
  PENDING: TransactionStatus.PENDING,
  PROCESSING: TransactionStatus.PROCESSING,
  COMPLETED: TransactionStatus.COMPLETED,
  FAILED: TransactionStatus.FAILED,
  REVERSED: TransactionStatus.REVERSED,
} as const;

/** Terminal states for synchronous posting (no further ledger writes). */
export const TERMINAL_TRANSACTION_STATUSES: readonly TransactionStatus[] = [
  TransactionStatus.COMPLETED,
  TransactionStatus.FAILED,
  TransactionStatus.REVERSED,
];
