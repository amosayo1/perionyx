/**
 * Program 1 — Treasury Intelligence Platform: Liquidity Analysis
 *
 * Measured liquidity facts over liquidity positions: totals by category,
 * average liquidation horizon, and locked-cash exposure.
 */

import { getTreasuryDataSource } from "../data-source";
import { toNumber } from "./cash-position";
import type { LiquidityPositionRecord } from "../types";

export interface LiquidityCategoryPosition {
  category: string;
  amount: number;
  daysToLiquidate: number;
  entries: number;
}

export interface LiquidityAnalysis {
  tenantId: string;
  totalLiquidAssets: number;
  byCategory: LiquidityCategoryPosition[];
  /** Average days to liquidate across positions, weighted by amount. */
  weightedLiquidationDays: number;
  measuredAt: string;
}

export function analyzeLiquidity(positions: LiquidityPositionRecord[], now: string): LiquidityAnalysis {
  const byCategory = new Map<string, LiquidityCategoryPosition>();
  let totalAmount = 0;
  let weightedDays = 0;

  for (const p of positions) {
    const amount = toNumber(p.amount);
    totalAmount += amount;
    weightedDays += amount * p.daysToLiquidate;

    const entry = byCategory.get(p.category) ?? {
      category: p.category,
      amount: 0,
      daysToLiquidate: p.daysToLiquidate,
      entries: 0,
    };
    entry.amount += amount;
    entry.entries += 1;
    byCategory.set(p.category, entry);
  }

  return {
    tenantId: positions[0]?.tenantId ?? "",
    totalLiquidAssets: totalAmount,
    byCategory: [...byCategory.values()].sort((a, b) => b.amount - a.amount),
    weightedLiquidationDays: totalAmount > 0 ? weightedDays / totalAmount : 0,
    measuredAt: now,
  };
}

export async function analyzeLiquidityForTenant(tenantId: string, now = new Date().toISOString()): Promise<LiquidityAnalysis> {
  const positions = await getTreasuryDataSource().getLiquidityPositions(tenantId);
  return analyzeLiquidity(positions, now);
}
