/**
 * Phase 21B.2 — Seed Utilities
 *
 * Deterministic random number generation, date helpers, and common utilities
 * for enterprise AP seed data. Every function is pure and reproducible.
 */

import { randomUUID } from "crypto";

// ── Deterministic PRNG (mulberry32) ──────────────────────────────────────────

export function createRng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Deterministic ID generation ──────────────────────────────────────────────

let idCounter = 0;
export function detId(prefix: string, rng: () => number): string {
  const n = Math.floor(rng() * 1000000).toString(36).padStart(5, "0");
  return `${prefix}_${n}`;
}

export function uuidFromSeed(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const chr = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(0, 3)}-${((parseInt(hex.slice(0, 2), 16) & 0x3f) | 0x80).toString(16)}${hex.slice(0, 2)}-${hex.slice(0, 12).padStart(12, "0")}`;
}

// ── Array helpers ────────────────────────────────────────────────────────────

export function pick<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function pickN<T>(arr: readonly T[], n: number, rng: () => number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

export function weightedPick<T>(items: readonly T[], weights: number[], rng: () => number): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function shuffle<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ── Number helpers ───────────────────────────────────────────────────────────

export function randInt(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function randFloat(min: number, max: number, rng: () => number): number {
  return min + rng() * (max - min);
}

export function randDecimal(min: number, max: number, places: number, rng: () => number): number {
  const val = randFloat(min, max, rng);
  return parseFloat(val.toFixed(places));
}

export function roundToCents(n: number): number {
  return Math.round(n * 100) / 100;
}

// ── Date helpers ─────────────────────────────────────────────────────────────

export function daysAgo(days: number, base: Date = new Date("2026-07-24")): Date {
  const d = new Date(base);
  d.setDate(d.getDate() - days);
  return d;
}

export function daysFromNow(days: number, base: Date = new Date("2026-07-24")): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

export function randomDateInRange(start: Date, end: Date, rng: () => number): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  return new Date(startTime + rng() * (endTime - startTime));
}

export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return result;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// ── String helpers ───────────────────────────────────────────────────────────

export function padNum(n: number, len: number): string {
  return String(n).padStart(len, "0");
}

export function currencyCode(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

// ── Prisma Decimal helper ────────────────────────────────────────────────────

export function dec(n: number): { toString(): string; valueOf(): number } {
  return { toString: () => n.toFixed(12), valueOf: () => n };
}

// ── Progress tracking ────────────────────────────────────────────────────────

export function logProgress(label: string, current: number, total: number) {
  if (current % Math.max(1, Math.floor(total / 10)) === 0 || current === total) {
    const pct = ((current / total) * 100).toFixed(0);
    process.stdout.write(`  ${label}: ${current}/${total} (${pct}%)\n`);
  }
}
