/**
 * Program 1 — Treasury Intelligence Platform: Evidence Loaders
 *
 * Canonical load keys + fallback loaders for the treasury evidence providers.
 * Every provider reads through `EvidenceAssemblyContext.load(key, fn)`; a
 * consumer may seed pre-loaded records under the same keys and the provider
 * never re-fetches. All data flows through the TreasuryDataSource boundary —
 * never Prisma directly in a provider.
 */

import type { EvidenceAssemblyContext } from "@/modules/evidence/types";
import { getTreasuryDataSource } from "../data-source";
import { TREASURY_LOAD_KEYS } from "../constants";
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
} from "../types";

export { TREASURY_LOAD_KEYS };

export async function loadPayment(
  context: EvidenceAssemblyContext,
): Promise<TreasuryPaymentRecord | null> {
  return context.load<TreasuryPaymentRecord | null>(TREASURY_LOAD_KEYS.payment, async () => {
    const all = await getTreasuryDataSource().getPayments(context.request.tenantId);
    return all.find((p) => p.id === context.request.entityId) ?? null;
  });
}

export async function loadTransfer(
  context: EvidenceAssemblyContext,
): Promise<TreasuryTransferRecord | null> {
  return context.load<TreasuryTransferRecord | null>(TREASURY_LOAD_KEYS.transfer, async () => {
    const all = await getTreasuryDataSource().getTransfers(context.request.tenantId);
    return all.find((t) => t.id === context.request.entityId) ?? null;
  });
}

export async function loadFunding(
  context: EvidenceAssemblyContext,
): Promise<TreasuryFundingRecord | null> {
  return context.load<TreasuryFundingRecord | null>(TREASURY_LOAD_KEYS.funding, async () => {
    const all = await getTreasuryDataSource().getFundingRequests(context.request.tenantId);
    return all.find((f) => f.id === context.request.entityId) ?? null;
  });
}

export async function loadCashPositions(
  context: EvidenceAssemblyContext,
): Promise<CashPositionRecord[]> {
  return context.load<CashPositionRecord[]>(TREASURY_LOAD_KEYS.cashPosition, async () =>
    getTreasuryDataSource().getCashPositions(context.request.tenantId),
  );
}

export async function loadCashPosition(
  context: EvidenceAssemblyContext,
): Promise<CashPositionRecord | null> {
  return context.load<CashPositionRecord | null>(`${TREASURY_LOAD_KEYS.cashPosition}:one`, async () => {
    const all = await loadCashPositions(context);
    return all.find((p) => p.id === context.request.entityId) ?? null;
  });
}

export async function loadForecast(
  context: EvidenceAssemblyContext,
): Promise<CashForecastRecord | null> {
  return context.load<CashForecastRecord | null>(TREASURY_LOAD_KEYS.forecast, async () => {
    const all = await getTreasuryDataSource().getForecasts(context.request.tenantId);
    if (all.length === 0) return null;
    return all.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0];
  });
}

export async function loadBankAccount(
  context: EvidenceAssemblyContext,
): Promise<BankAccountRecord | null> {
  return context.load<BankAccountRecord | null>(TREASURY_LOAD_KEYS.bankAccount, async () => {
    const all = await getTreasuryDataSource().getBankAccounts(context.request.tenantId);
    return all.find((a) => a.id === context.request.entityId) ?? null;
  });
}

export async function loadLiquidity(
  context: EvidenceAssemblyContext,
): Promise<LiquidityPositionRecord[]> {
  return context.load<LiquidityPositionRecord[]>(TREASURY_LOAD_KEYS.liquidity, async () =>
    getTreasuryDataSource().getLiquidityPositions(context.request.tenantId),
  );
}

export async function loadFxExposure(
  context: EvidenceAssemblyContext,
): Promise<FxExposureRecord[]> {
  return context.load<FxExposureRecord[]>(TREASURY_LOAD_KEYS.fxExposure, async () =>
    getTreasuryDataSource().getFxExposure(context.request.tenantId),
  );
}

export async function loadAlerts(
  context: EvidenceAssemblyContext,
): Promise<TreasuryAlertRecord[]> {
  return context.load<TreasuryAlertRecord[]>(TREASURY_LOAD_KEYS.alerts, async () =>
    getTreasuryDataSource().getAlerts(context.request.tenantId),
  );
}
