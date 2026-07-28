/**
 * Phase 22.0B — EDL Canonical Typography Tokens
 *
 * INTER is the primary typeface. JETBRAINS MONO for code/numbers.
 * Every text element in Perionyx derives from these tokens.
 */

// ── Font Families ────────────────────────────────────────────────────────────

export const FONT_FAMILY = {
  /** Primary UI font — Inter via next/font */
  sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  /** Code + financial numbers — JetBrains Mono via next/font */
  mono: "'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Code', monospace",
  /** Arabic support — loaded on demand */
  arabic: "'Noto Kufi Arabic', 'Inter', sans-serif",
} as const;

// ── Font Sizes (type scale) ──────────────────────────────────────────────────
// Each entry: [fontSize, lineHeight, letterSpacing, fontWeight]

export const FONT_SIZE = {
  /** 48px / 56px — Hero section titles */
  display: { size: "3rem", lineHeight: "3.5rem", tracking: "-0.02em", weight: 700 },
  /** 36px / 44px — Page hero */
  hero: { size: "2.25rem", lineHeight: "2.75rem", tracking: "-0.02em", weight: 700 },
  /** 30px / 36px — Section title */
  h1: { size: "1.875rem", lineHeight: "2.25rem", tracking: "-0.015em", weight: 600 },
  /** 24px / 32px — Card title */
  h2: { size: "1.5rem", lineHeight: "2rem", tracking: "-0.01em", weight: 600 },
  /** 20px / 28px — Subsection */
  h3: { size: "1.25rem", lineHeight: "1.75rem", tracking: "-0.005em", weight: 600 },
  /** 18px / 28px — Minor heading */
  h4: { size: "1.125rem", lineHeight: "1.75rem", tracking: "0em", weight: 500 },
  /** 16px / 24px — Body text */
  body: { size: "1rem", lineHeight: "1.5rem", tracking: "0em", weight: 400 },
  /** 16px / 24px — Body medium weight */
  bodyMedium: { size: "1rem", lineHeight: "1.5rem", tracking: "0em", weight: 500 },
  /** 14px / 20px — Small body / secondary text */
  sm: { size: "0.875rem", lineHeight: "1.25rem", tracking: "0em", weight: 400 },
  /** 14px / 20px — Small body medium */
  smMedium: { size: "0.875rem", lineHeight: "1.25rem", tracking: "0em", weight: 500 },
  /** 12px / 16px — Caption / label */
  xs: { size: "0.75rem", lineHeight: "1rem", tracking: "0.01em", weight: 400 },
  /** 12px / 16px — Caption medium */
  xsMedium: { size: "0.75rem", lineHeight: "1rem", tracking: "0.01em", weight: 500 },
  /** 11px / 14px — Micro text */
  micro: { size: "0.6875rem", lineHeight: "0.875rem", tracking: "0.02em", weight: 500 },
  /** Financial numbers — tabular figures, mono font */
  financial: { size: "1.5rem", lineHeight: "2rem", tracking: "-0.01em", weight: 600, font: FONT_FAMILY.mono },
  /** Financial numbers — large */
  financialLg: { size: "2rem", lineHeight: "2.5rem", tracking: "-0.015em", weight: 700, font: FONT_FAMILY.mono },
  /** Financial numbers — small */
  financialSm: { size: "0.875rem", lineHeight: "1.25rem", tracking: "0em", weight: 500, font: FONT_FAMILY.mono },
  /** Table cell — body */
  table: { size: "0.875rem", lineHeight: "1.25rem", tracking: "0em", weight: 400 },
  /** Table cell — header */
  tableHeader: { size: "0.75rem", lineHeight: "1rem", tracking: "0.02em", weight: 600 },
  /** Code block */
  code: { size: "0.875rem", lineHeight: "1.5rem", tracking: "0em", weight: 400, font: FONT_FAMILY.mono },
  /** Tooltip */
  tooltip: { size: "0.75rem", lineHeight: "1rem", tracking: "0.01em", weight: 500 },
  /** Badge/Tag */
  badge: { size: "0.6875rem", lineHeight: "0.875rem", tracking: "0.02em", weight: 600 },
} as const;

// ── Tailwind Class Equivalents ───────────────────────────────────────────────

export const TYPOGRAPHY_CLASSES = {
  display: "text-[3rem] leading-[3.5rem] tracking-tight font-bold",
  hero: "text-[2.25rem] leading-[2.75rem] tracking-tight font-bold",
  h1: "text-[1.875rem] leading-[2.25rem] tracking-tight font-semibold",
  h2: "text-[1.5rem] leading-[2rem] tracking-tight font-semibold",
  h3: "text-[1.25rem] leading-[1.75rem] font-semibold",
  h4: "text-[1.125rem] leading-[1.75rem] font-medium",
  body: "text-base leading-relaxed font-normal",
  bodyMedium: "text-base leading-relaxed font-medium",
  sm: "text-sm leading-normal font-normal",
  smMedium: "text-sm leading-normal font-medium",
  xs: "text-xs leading-4 tracking-wide font-normal",
  xsMedium: "text-xs leading-4 tracking-wide font-medium",
  micro: "text-[11px] leading-3.5 tracking-widest font-medium",
} as const;

// ── Font Weights ─────────────────────────────────────────────────────────────

export const FONT_WEIGHT = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

// ── Line Heights ─────────────────────────────────────────────────────────────

export const LINE_HEIGHT = {
  tight: "1.25",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.625",
  loose: "1.75",
  cozy: "1.65",
} as const;

// ── Letter Spacing ───────────────────────────────────────────────────────────

export const TRACKING = {
  tighter: "-0.02em",
  tight: "-0.01em",
  normal: "0em",
  wide: "0.01em",
  wider: "0.02em",
  widest: "0.04em",
} as const;

// ── Numeric Formatting ───────────────────────────────────────────────────────

export const NUMERIC = {
  /** Tabular figures for column alignment in tables */
  fontVariantNumeric: "tabular-nums",
  /** Monospace for financial values */
  fontFamily: FONT_FAMILY.mono,
  /** Right-aligned by default for numbers */
  textAlign: "right" as const,
} as const;
