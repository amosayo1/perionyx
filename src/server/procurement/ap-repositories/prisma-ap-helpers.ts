/**
 * Phase 21A.2 — Shared Prisma Mapping Helpers for AP Repositories
 *
 * Converts between domain types (string dates) and Prisma types (Decimal/DateTime).
 * Financial precision rule: ALL Decimal fields are converted to number at the domain boundary.
 * ALL arithmetic on money MUST use financial-precision.ts helpers.
 */

/** Convert Prisma Decimal → domain number. Returns 0 for null/undefined. Accepts unknown for Record access. */
export function toNumber(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value) || 0;
  if (typeof value === "object" && value !== null && "toNumber" in value) {
    return (value as { toNumber(): number }).toNumber();
  }
  return 0;
}

/**
 * Convert domain string date → Prisma DateTime for NON-NULLABLE fields.
 * Returns Date for non-null/empty strings, falls back to new Date() for null/empty.
 * Use this for Prisma required DateTime fields.
 */
export function toRequiredDate(value: string | null | undefined): Date {
  if (value == null || value === "") return new Date();
  return new Date(value);
}

/**
 * Convert domain string date → Prisma DateTime for NULLABLE fields.
 * Returns Date for non-null/empty strings, null otherwise.
 * Use this for Prisma optional DateTime fields.
 */
export function toDate(value: string | null | undefined): Date | null {
  if (value == null || value === "") return null;
  return new Date(value);
}

/** Convert Prisma DateTime → domain ISO string. */
export function toIso(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return null;
}

/** Parse JSON string array (for tags, requiredRoles). Returns [] for null/empty. */
export function parseJsonArray(value: unknown): string[] {
  if (!value || typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Stringify string array for storage. */
export function stringifyJsonArray(value: string[] | null | undefined): string {
  if (!value || value.length === 0) return "[]";
  return JSON.stringify(value);
}

/**
 * Build a Prisma date range filter from optional from/to strings.
 * Returns undefined if neither is set.
 */
export function dateRangeFilter(from?: string, to?: string): { gte?: Date; lte?: Date } | undefined {
  if (!from && !to) return undefined;
  const filter: { gte?: Date; lte?: Date } = {};
  if (from) filter.gte = new Date(from);
  if (to) filter.lte = new Date(to);
  return filter;
}
