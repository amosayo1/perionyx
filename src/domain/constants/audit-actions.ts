/** Stored in `AuditLog.action`; use these constants from services for stable identifiers. */
export const AuditAction = {
  COMPANY_CREATE: "company.create",
  COMPANY_UPDATE: "company.update",
  WALLET_CREATE: "wallet.create",
  TRANSACTION_WALLET_CREDIT: "transaction.wallet_credit",
  TRANSACTION_INTERNAL_TRANSFER: "transaction.internal_transfer",
  TRANSACTION_APPROVAL_REQUIRED: "transaction.approval_required",
  TRANSACTION_APPROVAL_COMPLETED: "transaction.approval_completed",
  TRANSACTION_APPROVAL_REJECTED: "transaction.approval_rejected",
  RATE_UPDATED: "rate.updated",
  CROSS_CURRENCY_TRANSFER: "transaction.cross_currency_transfer",
  FX_RATE_SYNC: "fx.rate_sync",
  FX_RATE_SYNC_FAILED: "fx.rate_sync_failed",
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];
