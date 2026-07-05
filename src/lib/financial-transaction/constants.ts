import type { FinancialEntity } from "./types";

export const ENTITY_TABLE_MAP: Record<FinancialEntity, string> = {
  Wallet: "Wallet",
  TreasuryAccount: "treasury_accounts",
  Transaction: "Transaction",
  LedgerEntry: "LedgerEntry",
  ExternalTransaction: "external_transactions",
  ExternalBalance: "external_balances",
  ReconciliationRun: "ReconciliationRun",
  ReconciliationMatch: "reconciliation_matches",
  AccountingInvoice: "accounting_invoices",
  ExchangeRate: "ExchangeRate",
  WorkflowInstance: "WorkflowInstance",
  WorkflowStepInstance: "WorkflowStepInstance",
};

export const LOCK_MODE_SQL: Record<string, string> = {
  FOR_UPDATE: "FOR UPDATE",
  FOR_NO_KEY_UPDATE: "FOR NO KEY UPDATE",
  FOR_SHARE: "FOR SHARE",
  FOR_KEY_SHARE: "FOR KEY SHARE",
};

export const LOCK_BEHAVIOR_SQL: Record<string, string> = {
  NOWAIT: "NOWAIT",
  SKIP_LOCKED: "SKIP LOCKED",
};

export const DEFAULT_LOCK_RETRY = { maxRetries: 3, baseDelayMs: 100, maxDelayMs: 3000 };
