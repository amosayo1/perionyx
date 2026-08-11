/**
 * Program 1 — Treasury Intelligence Platform: Data Source Boundary
 *
 * The only place the intelligence layer reads treasury data. Every engine,
 * provider and dashboard section consumes records through this interface —
 * never Prisma directly. The default implementation is `PrismaTreasuryDataSource`
 * (see `prisma-data-source.ts`); tests inject an in-memory stub so the
 * intelligence layer is fully deterministic and DB-free.
 *
 * This is the constitutional Law 1 boundary: the business domain never imports
 * provider SDKs. Swap the source without touching the engines.
 */

import type {
  BankAccountRecord,
  CashForecastRecord,
  CashPositionRecord,
  FxExposureRecord,
  LiquidityPositionRecord,
  TreasuryAlertRecord,
  TreasuryFundingRecord,
  TreasuryPaymentRecord,
  TreasuryTransferRecord,
} from "./types";

export interface TreasuryDataSource {
  getCashPositions(tenantId: string): Promise<CashPositionRecord[]>;
  getLiquidityPositions(tenantId: string): Promise<LiquidityPositionRecord[]>;
  getForecasts(tenantId: string): Promise<CashForecastRecord[]>;
  getBankAccounts(tenantId: string): Promise<BankAccountRecord[]>;
  getPayments(tenantId: string): Promise<TreasuryPaymentRecord[]>;
  getTransfers(tenantId: string): Promise<TreasuryTransferRecord[]>;
  getFundingRequests(tenantId: string): Promise<TreasuryFundingRecord[]>;
  getFxExposure(tenantId: string): Promise<FxExposureRecord[]>;
  getAlerts(tenantId: string): Promise<TreasuryAlertRecord[]>;
}

let current: TreasuryDataSource | null = null;

/**
 * The active data source. Defaults lazily to the Prisma adapter so the module
 * works with zero configuration; tests replace it with an in-memory stub.
 */
export function getTreasuryDataSource(): TreasuryDataSource {
  if (!current) {
    // Lazy require avoids pulling Prisma into the barrel until actually used.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaTreasuryDataSource } = require("./prisma-data-source") as {
      PrismaTreasuryDataSource: new () => TreasuryDataSource;
    };
    current = new PrismaTreasuryDataSource();
  }
  return current;
}

/** Test-only / wiring hook: replace the active data source. */
export function setTreasuryDataSource(source: TreasuryDataSource): void {
  current = source;
}

/** Test-only: restore the default Prisma source. */
export function resetTreasuryDataSource(): void {
  current = null;
}
