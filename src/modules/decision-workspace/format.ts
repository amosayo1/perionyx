/**
 * Phase 22.3 — Decision Workspace: Formatting helpers
 *
 * Single formatting layer for the Decision Workspace (F-08: one currency layer,
 * PP-131: shared capability implemented once). Safe to import from both server
 * and client code — pure functions only, no Prisma, no Node built-ins.
 */

const CURRENCY = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const COMPACT = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
});

const BYTES = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

export function formatCurrency(amount: number, currency?: string | null): string {
  if (!Number.isFinite(amount)) return "—";
  const nf =
    currency && currency !== "USD"
      ? new Intl.NumberFormat(undefined, {
          style: "currency",
          currency,
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })
      : CURRENCY;
  return nf.format(amount);
}

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return COMPACT.format(n);
}

export function formatPercent(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(digits)}%`;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return `${BYTES.format(bytes)} B`;
  if (bytes < 1024 * 1024) return `${BYTES.format(bytes / 1024)} KB`;
  return `${BYTES.format(bytes / (1024 * 1024))} MB`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ageDays(iso: string | null | undefined, from = new Date()): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const ms = from.getTime() - d.getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}
