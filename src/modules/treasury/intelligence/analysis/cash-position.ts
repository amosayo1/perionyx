/**
 * Program 1 — Treasury Intelligence Platform: Cash Position Analysis
 *
 * Measured facts over cash positions: totals by currency, classification
 * breakdown, balance staleness and concentration risk. Every derived value is
 * computed from the recorded positions — nothing is invented.
 */

import { getTreasuryDataSource } from "../data-source";
import { TREASURY_BALANCE_STALE_DAYS, TREASURY_CONCENTRATION_THRESHOLD } from "../constants";
import type { CashPositionRecord, TreasuryAlertRecord } from "../types";

export interface CurrencyPosition {
  currency: string;
  totalBalance: number;
  availableBalance: number;
  restrictedBalance: number;
  floatBalance: number;
  classificationBreakdown: Record<string, number>;
  bankCount: number;
}

export interface CashPositionAnalysis {
  tenantId: string;
  totalBalance: number;
  availableBalance: number;
  positionsByCurrency: CurrencyPosition[];
  /** Positions whose bank sync is older than the staleness threshold. */
  stalePositions: CashPositionRecord[];
  /** Banks holding more than the concentration threshold of total cash. */
  concentration: Array<{ bankAccountId: string; institutionName: string; share: number }>;
  alerts: TreasuryAlertRecord[];
  lastSyncedAt: string | null;
  measuredAt: string;
}

export function analyzeCashPosition(
  positions: CashPositionRecord[],
  alerts: TreasuryAlertRecord[],
  now: string,
): CashPositionAnalysis {
  const totalBalance = positions.reduce((sum, p) => sum + toNumber(p.totalBalance), 0);
  const availableBalance = positions.reduce((sum, p) => sum + toNumber(p.availableBalance), 0);

  const byCurrency = new Map<string, CurrencyPosition>();
  for (const p of positions) {
    let entry = byCurrency.get(p.currency);
    if (!entry) {
      entry = {
        currency: p.currency,
        totalBalance: 0,
        availableBalance: 0,
        restrictedBalance: 0,
        floatBalance: 0,
        classificationBreakdown: {},
        bankCount: 0,
      };
      byCurrency.set(p.currency, entry);
    }
    entry.totalBalance += toNumber(p.totalBalance);
    entry.availableBalance += toNumber(p.availableBalance);
    entry.floatBalance += toNumber(p.floatBalance);
    if (p.classification === "restricted") entry.restrictedBalance += toNumber(p.bankBalance);
    entry.classificationBreakdown[p.classification] =
      (entry.classificationBreakdown[p.classification] ?? 0) + toNumber(p.totalBalance);
    entry.bankCount += 1;
  }

  const stalePositions = positions.filter((p) => {
    if (!p.lastSyncedAt) return true;
    const ageDays = (new Date(now).getTime() - new Date(p.lastSyncedAt).getTime()) / 86_400_000;
    return ageDays > TREASURY_BALANCE_STALE_DAYS;
  });

  const byBank = new Map<string, { bankAccountId: string; institutionName: string; total: number }>();
  for (const p of positions) {
    const current = byBank.get(p.bankAccountId) ?? {
      bankAccountId: p.bankAccountId,
      institutionName: p.institutionName,
      total: 0,
    };
    current.total += toNumber(p.totalBalance);
    byBank.set(p.bankAccountId, current);
  }
  const concentration = totalBalance > 0
    ? [...byBank.values()]
        .map((b) => ({ bankAccountId: b.bankAccountId, institutionName: b.institutionName, share: b.total / totalBalance }))
        .filter((b) => b.share >= TREASURY_CONCENTRATION_THRESHOLD)
        .sort((a, b) => b.share - a.share)
    : [];

  const lastSyncedAt = positions
    .map((p) => p.lastSyncedAt)
    .filter(Boolean)
    .sort()
    .at(-1) ?? null;

  return {
    tenantId: positions[0]?.tenantId ?? "",
    totalBalance,
    availableBalance,
    positionsByCurrency: [...byCurrency.values()].sort((a, b) => b.totalBalance - a.totalBalance),
    stalePositions: stalePositions.sort((a, b) => a.id.localeCompare(b.id)),
    concentration,
    alerts,
    lastSyncedAt,
    measuredAt: now,
  };
}

/** Analysis through the data-source boundary — the default entry point. */
export async function analyzeCashPositionForTenant(tenantId: string, now = new Date().toISOString()): Promise<CashPositionAnalysis> {
  const source = getTreasuryDataSource();
  const [positions, alerts] = await Promise.all([
    source.getCashPositions(tenantId),
    source.getAlerts(tenantId),
  ]);
  return analyzeCashPosition(positions, alerts, now);
}

export function toNumber(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
