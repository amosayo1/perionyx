export enum OperationCategory {
  ReadOnly = "READ_ONLY",
  BusinessRead = "BUSINESS_READ",
  FinancialWrite = "FINANCIAL_WRITE",
  AdminConfig = "ADMIN_CONFIG",
}

export type FinancialEntity =
  | "Wallet"
  | "TreasuryAccount"
  | "Transaction"
  | "LedgerEntry"
  | "ExternalTransaction"
  | "ExternalBalance"
  | "ReconciliationRun"
  | "ReconciliationMatch"
  | "AccountingInvoice"
  | "ExchangeRate"
  | "WorkflowInstance"
  | "WorkflowStepInstance";

export type RetryConfig = {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
};

export type TransactionOptions = {
  isolationLevel?: "ReadUncommitted" | "ReadCommitted" | "RepeatableRead" | "Serializable";
  maxWait?: number;
  timeout?: number;
  retry?: RetryConfig;
};

export type RowLockTarget = {
  entity: FinancialEntity;
  id: string;
};

export type OptimisticLockCheck = {
  entity: FinancialEntity;
  id: string;
  expectedVersion: number;
};

export type FinancialWriteResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  retryable: boolean;
};

export type LockMode =
  | "FOR_UPDATE"
  | "FOR_NO_KEY_UPDATE"
  | "FOR_SHARE"
  | "FOR_KEY_SHARE";

export type LockBehavior = "WAIT" | "NOWAIT" | "SKIP_LOCKED";

export type LockTarget = {
  entity: FinancialEntity;
  id: string;
  mode?: LockMode;
};

export type LockOptions = {
  behavior?: LockBehavior;
  acquireTimeoutMs?: number;
  retry?: RetryConfig;
  enforceOrdering?: boolean;
};

export type DeadlockError = {
  code: "DEADLOCK";
  message: string;
  retryable: true;
};
