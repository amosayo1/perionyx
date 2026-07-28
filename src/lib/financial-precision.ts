import { Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";

const Decimal = Prisma.Decimal;

export { Decimal };

/**
 * Canonical financial rounding using banker's rounding (round-half-to-even).
 * This eliminates the systematic upward bias of Math.round() (round-half-away-from-zero).
 *
 * @param value - The number to round
 * @param decimals - Decimal places (default 2 for currency)
 * @returns Rounded number
 */
export function financialRound(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  const shifted = value * factor;

  if (Number.isInteger(shifted)) return shifted / factor;

  const floor = Math.floor(shifted);
  const ceil = Math.ceil(shifted);
  const frac = shifted - floor;

  if (frac < 0.5) return floor / factor;
  if (frac > 0.5) return ceil / factor;

  return (floor % 2 === 0 ? floor : ceil) / factor;
}

/**
 * Round a Prisma.Decimal to specified decimal places using banker's rounding.
 * Returns a new Decimal — does not mutate the input.
 */
export function roundDecimal(value: Prisma.Decimal, decimals = 2): Prisma.Decimal {
  return value.toDecimalPlaces(decimals, Prisma.Decimal.ROUND_HALF_EVEN);
}

/**
 * Convert any value to Prisma.Decimal safely.
 * Handles: Prisma.Decimal, string, number, null, undefined.
 * Returns Decimal(0) for null/undefined.
 *
 * WARNING: For monetary calculations, prefer passing Prisma.Decimal or string
 * directly. Use this only when converting from JavaScript number inputs
 * (e.g., form inputs, API parameters).
 */
export function toDecimal(value: Prisma.Decimal | string | number | null | undefined): Prisma.Decimal {
  if (value == null) return new Decimal(0);
  if (value instanceof Decimal) return value;
  return new Decimal(String(value));
}

/**
 * Sum an array of values as Prisma.Decimal.
 * Safe for monetary aggregation — no IEEE 754 floating-point accumulation.
 */
export function sumDecimals(values: (Prisma.Decimal | string | number | null | undefined)[]): Prisma.Decimal {
  return values.reduce<Prisma.Decimal>((acc, v) => acc.plus(toDecimal(v)), new Decimal(0));
}

/**
 * Multiply two values as Prisma.Decimal.
 * Safe for monetary multiplication (e.g., rate × amount).
 */
export function multiplyDecimals(
  a: Prisma.Decimal | string | number,
  b: Prisma.Decimal | string | number,
): Prisma.Decimal {
  return toDecimal(a).mul(toDecimal(b));
}

/**
 * Divide two values as Prisma.Decimal.
 * Safe for monetary division (e.g., allocation splits).
 * Returns Decimal(0) if divisor is zero.
 */
export function divideDecimals(
  dividend: Prisma.Decimal | string | number,
  divisor: Prisma.Decimal | string | number,
  scale = 12,
): Prisma.Decimal {
  const d = toDecimal(divisor);
  if (d.isZero()) return new Decimal(0);
  return toDecimal(dividend).div(d).toDecimalPlaces(scale, Prisma.Decimal.ROUND_HALF_EVEN);
}

/**
 * Allocate a total amount across N targets using percentage-based allocation.
 * Handles the residual (rounding remainder) by assigning it to the first target.
 *
 * @param total - Total amount to allocate
 * @param targets - Array of target identifiers
 * @param percentage - Optional percentage (if null, splits equally)
 * @returns Array of { targetId, amount, percentage }
 */
export function allocateAmount<T extends string>(
  total: Prisma.Decimal | string | number,
  targets: T[],
  percentage?: number | null,
): Array<{ targetId: T; amount: Prisma.Decimal; percentage: number }> {
  const totalDec = toDecimal(total);
  const n = targets.length;
  if (n === 0) return [];

  const perTargetPct = percentage != null ? percentage / n : 100 / n;
  const perTargetAmount = totalDec.mul(perTargetPct).div(100);

  const results: Array<{ targetId: T; amount: Prisma.Decimal; percentage: number }> = [];
  let allocated = new Decimal(0);

  for (let i = 0; i < n; i++) {
    if (i === n - 1) {
      const residual = totalDec.minus(allocated);
      results.push({ targetId: targets[i], amount: residual.toDecimalPlaces(12, Prisma.Decimal.ROUND_HALF_EVEN), percentage: perTargetPct });
    } else {
      const amt = perTargetAmount.toDecimalPlaces(12, Prisma.Decimal.ROUND_HALF_EVEN);
      allocated = allocated.plus(amt);
      results.push({ targetId: targets[i], amount: amt, percentage: perTargetPct });
    }
  }

  return results;
}

/**
 * Calculate tax amount using Prisma.Decimal.
 * Returns { taxAmount, netAmount, grossAmount } with proper rounding.
 */
export function calculateTax(
  grossAmount: Prisma.Decimal | string | number,
  taxRate: number,
  decimals = 2,
): { taxAmount: Prisma.Decimal; netAmount: Prisma.Decimal; grossAmount: Prisma.Decimal } {
  const gross = toDecimal(grossAmount);
  const rate = new Decimal(String(taxRate)).div(100);
  const taxAmount = gross.mul(rate).toDecimalPlaces(decimals, Prisma.Decimal.ROUND_HALF_EVEN);
  const netAmount = gross.minus(taxAmount).toDecimalPlaces(decimals, Prisma.Decimal.ROUND_HALF_EVEN);
  return { taxAmount, netAmount, grossAmount: gross };
}

/**
 * Calculate withholding tax using Prisma.Decimal.
 */
export function calculateWithholding(
  grossAmount: Prisma.Decimal | string | number,
  rate: number,
  decimals = 2,
): { grossAmount: Prisma.Decimal; withholdingAmount: Prisma.Decimal; netAmount: Prisma.Decimal } {
  const gross = toDecimal(grossAmount);
  const r = new Decimal(String(rate)).div(100);
  const withholdingAmount = gross.mul(r).toDecimalPlaces(decimals, Prisma.Decimal.ROUND_HALF_EVEN);
  const netAmount = gross.minus(withholdingAmount).toDecimalPlaces(decimals, Prisma.Decimal.ROUND_HALF_EVEN);
  return { grossAmount: gross, withholdingAmount, netAmount };
}

/**
 * Convert a Prisma.Decimal to a safe JavaScript number for display purposes ONLY.
 * This should NEVER be used for financial calculations.
 */
export function toDisplayNumber(value: Prisma.Decimal | string | null | undefined): number {
  if (value == null) return 0;
  const d = toDecimal(value);
  return d.toNumber();
}

/**
 * Format a Prisma.Decimal as currency string using Intl.NumberFormat.
 * Safe for display — converts to number only at the final formatting step.
 */
export function formatDecimalCurrency(
  value: Prisma.Decimal | string | number | null | undefined,
  currencyCode = "USD",
  locale?: string,
): string {
  const d = toDecimal(value);
  const n = d.toNumber();
  if (!Number.isFinite(n)) return String(value);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch (err) {
    logger.error(err, "Failed to format decimal currency");
    return `${String(value)} ${currencyCode}`;
  }
}

/**
 * Format a Prisma.Decimal as compact currency (e.g., $1.2M, $3.4K).
 * Safe for display — converts to number only at the final formatting step.
 */
export function formatDecimalCompact(
  value: Prisma.Decimal | string | number | null | undefined,
  currencySymbol = "$",
): string {
  const d = toDecimal(value);
  const n = d.toNumber();
  if (!Number.isFinite(n)) return String(value);
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}${currencySymbol}${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}${currencySymbol}${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}${currencySymbol}${(abs / 1_000).toFixed(2)}K`;
  return `${sign}${currencySymbol}${abs.toFixed(2)}`;
}

/**
 * Compare two Decimal values with a tolerance.
 * Useful for cross-currency validation where floating-point drift is expected.
 */
export function decimalEquals(
  a: Prisma.Decimal | string | number,
  b: Prisma.Decimal | string | number,
  tolerance = 0.01,
): boolean {
  const diff = toDecimal(a).minus(toDecimal(b)).abs();
  return diff.lte(tolerance);
}

/**
 * Check if a value is a valid monetary amount.
 * Must be finite, non-NaN, and within reasonable bounds.
 */
export function isValidMonetaryAmount(value: unknown): value is number {
  if (typeof value !== "number") return false;
  if (!Number.isFinite(value)) return false;
  if (Number.isNaN(value)) return false;
  return true;
}
