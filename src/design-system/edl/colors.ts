/**
 * Phase 22.0B — Enterprise Design Language (EDL) — Canonical Color Tokens
 *
 * Single source of truth for ALL color values in Perionyx.
 * Every component, every page, every animation consumes these tokens.
 *
 * CONFLICT RESOLUTION:
 * - surfaces.ts (#141414) → OVERRIDDEN by canonical #0a0a0f
 * - status.ts gold (#d4af37) → OVERRIDDEN by canonical #d4af37
 * - theme/defaults.ts (#040404) → OVERRIDDEN by canonical #0a0a0f
 * - All hardcoded #d4af37/#d4af37/#d4af37 in components → MUST migrate to these tokens
 */

// ── Core Brand ───────────────────────────────────────────────────────────────

export const BRAND = {
  gold: "#d4af37",
  goldHover: "#e5c04a",
  goldActive: "#c7a961",
  goldMuted: "rgba(212, 175, 55, 0.15)",
  goldSubtle: "rgba(212, 175, 55, 0.08)",
  goldBorder: "rgba(212, 175, 55, 0.2)",
  goldFocus: "rgba(212, 175, 55, 0.5)",
} as const;

// ── Surfaces (Dark-First) ────────────────────────────────────────────────────
// The foundational layer. Every surface derives from these 4 values.

export const SURFACES = {
  /** App background — deepest layer */
  base: "#0a0a0f",
  /** Card/panel surface — primary container */
  raised: "#111118",
  /** Elevated surfaces — dropdowns, popovers */
  elevated: "#1a1a24",
  /** Highest elevation — modals, dialogs */
  floating: "#222230",
  /** Overlay backdrop */
  overlay: "rgba(0, 0, 0, 0.6)",
  /** Sidebar background */
  sidebar: "#0a0a0f",
  /** Header/topbar background */
  header: "#0a0a0f",
} as const;

// ── Text ─────────────────────────────────────────────────────────────────────

export const TEXT = {
  primary: "#f7f6f2",
  secondary: "#a1a1aa",
  tertiary: "#71717a",
  disabled: "#52525b",
  inverse: "#0a0a0f",
  link: "#5e9eff",
  linkHover: "#7db1ff",
} as const;

// ── Borders ──────────────────────────────────────────────────────────────────

export const BORDERS = {
  default: "rgba(255, 255, 255, 0.08)",
  strong: "rgba(255, 255, 255, 0.12)",
  subtle: "rgba(255, 255, 255, 0.04)",
  gold: BRAND.goldBorder,
  focus: BRAND.goldFocus,
} as const;

// ── Semantic Status Colors ───────────────────────────────────────────────────

export const STATUS = {
  success: {
    DEFAULT: "#22c55e",
    hover: "#16a34a",
    muted: "rgba(34, 197, 94, 0.15)",
    subtle: "rgba(34, 197, 94, 0.08)",
    text: "#22c55e",
    bg: "rgba(34, 197, 94, 0.1)",
    border: "rgba(34, 197, 94, 0.3)",
    dot: "#22c55e",
  },
  warning: {
    DEFAULT: "#f59e0b",
    hover: "#d97706",
    muted: "rgba(245, 158, 11, 0.15)",
    subtle: "rgba(245, 158, 11, 0.08)",
    text: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.1)",
    border: "rgba(245, 158, 11, 0.3)",
    dot: "#f59e0b",
  },
  error: {
    DEFAULT: "#ef4444",
    hover: "#dc2626",
    muted: "rgba(239, 68, 68, 0.15)",
    subtle: "rgba(239, 68, 68, 0.08)",
    text: "#ef4444",
    bg: "rgba(239, 68, 68, 0.1)",
    border: "rgba(239, 68, 68, 0.3)",
    dot: "#ef4444",
  },
  info: {
    DEFAULT: "#3b82f6",
    hover: "#2563eb",
    muted: "rgba(59, 130, 246, 0.15)",
    subtle: "rgba(59, 130, 246, 0.08)",
    text: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.1)",
    border: "rgba(59, 130, 246, 0.3)",
    dot: "#3b82f6",
  },
  neutral: {
    DEFAULT: "#71717a",
    hover: "#52525b",
    muted: "rgba(113, 113, 122, 0.15)",
    subtle: "rgba(113, 113, 122, 0.08)",
    text: "#71717a",
    bg: "rgba(113, 113, 122, 0.1)",
    border: "rgba(113, 113, 122, 0.2)",
    dot: "#71717a",
  },
  gold: {
    DEFAULT: BRAND.gold,
    hover: BRAND.goldHover,
    muted: BRAND.goldMuted,
    subtle: BRAND.goldSubtle,
    text: BRAND.gold,
    bg: "rgba(212, 175, 55, 0.1)",
    border: BRAND.goldBorder,
    dot: BRAND.gold,
  },
} as const;

// ── Financial / Domain-Specific ──────────────────────────────────────────────

export const FINANCIAL = {
  /** Positive balance / gain */
  positive: STATUS.success.DEFAULT,
  positiveMuted: STATUS.success.muted,
  /** Negative balance / loss */
  negative: STATUS.error.DEFAULT,
  negativeMuted: STATUS.error.muted,
  /** Pending / in-progress */
  pending: STATUS.warning.DEFAULT,
  pendingMuted: STATUS.warning.muted,
  /** Neutral / informational */
  neutral: STATUS.info.DEFAULT,
  neutralMuted: STATUS.info.muted,
  /** Approved */
  approved: STATUS.success.DEFAULT,
  /** Rejected */
  rejected: STATUS.error.DEFAULT,
  /** Overdue (stronger than warning) */
  overdue: "#ef4444",
  overdueMuted: "rgba(239, 68, 68, 0.12)",
  /** Current / active */
  current: BRAND.gold,
  currentMuted: BRAND.goldMuted,
} as const;

// ── Risk Levels ──────────────────────────────────────────────────────────────

export const RISK = {
  low: STATUS.success.DEFAULT,
  lowMuted: STATUS.success.muted,
  medium: STATUS.warning.DEFAULT,
  mediumMuted: STATUS.warning.muted,
  high: STATUS.error.DEFAULT,
  highMuted: STATUS.error.muted,
  critical: "#dc2626",
  criticalMuted: "rgba(220, 38, 38, 0.15)",
} as const;

// ── Chart Palette ────────────────────────────────────────────────────────────

export const CHARTS = {
  primary: BRAND.gold,
  series: [
    BRAND.gold,      // Series 1 — gold (primary)
    "#22c55e",       // Series 2 — green
    "#3b82f6",       // Series 3 — blue
    "#f59e0b",       // Series 4 — amber
    "#ef4444",       // Series 5 — red
    "#a855f7",       // Series 6 — purple
    "#06b6d4",       // Series 7 — cyan
    "#ec4899",       // Series 8 — pink
  ] as const,
  axis: "rgba(255, 255, 255, 0.15)",
  grid: "rgba(255, 255, 255, 0.04)",
  tooltip: SURFACES.floating,
  positiveFill: "rgba(34, 197, 94, 0.6)",
  negativeFill: "rgba(239, 68, 68, 0.6)",
} as const;

// ── AI Confidence ────────────────────────────────────────────────────────────

export const AI = {
  high: STATUS.success.DEFAULT,
  highMuted: STATUS.success.muted,
  medium: STATUS.warning.DEFAULT,
  mediumMuted: STATUS.warning.muted,
  low: STATUS.error.DEFAULT,
  lowMuted: STATUS.error.muted,
  processing: BRAND.gold,
  processingMuted: BRAND.goldMuted,
} as const;

// ── Shadows ──────────────────────────────────────────────────────────────────

export const SHADOWS = {
  soft: "0 1px 3px rgba(0, 0, 0, 0.3)",
  medium: "0 4px 12px rgba(0, 0, 0, 0.4)",
  large: "0 8px 24px rgba(0, 0, 0, 0.5)",
  floating: "0 12px 40px rgba(0, 0, 0, 0.5)",
  glowGold: `0 0 20px rgba(212, 175, 55, 0.15)`,
  glowSuccess: `0 0 20px rgba(34, 197, 94, 0.15)`,
  glowDanger: `0 0 20px rgba(239, 68, 68, 0.15)`,
  glowInfo: `0 0 20px rgba(59, 130, 246, 0.15)`,
} as const;

// ── Elevation Composite ──────────────────────────────────────────────────────
// Pre-composed surface + border + shadow for each elevation level

export const ELEVATION = {
  base: {
    background: SURFACES.base,
    border: BORDERS.subtle,
    shadow: "none",
  },
  raised: {
    background: SURFACES.raised,
    border: BORDERS.default,
    shadow: SHADOWS.soft,
  },
  elevated: {
    background: SURFACES.elevated,
    border: BORDERS.default,
    shadow: SHADOWS.medium,
  },
  floating: {
    background: SURFACES.floating,
    border: BORDERS.strong,
    shadow: SHADOWS.large,
  },
  hover: {
    background: SURFACES.elevated,
    border: BORDERS.strong,
    shadow: SHADOWS.medium,
  },
  selected: {
    background: SURFACES.raised,
    border: BORDERS.gold,
    shadow: SHADOWS.glowGold,
  },
} as const;

// ── Composite Token Object (backward-compatible) ─────────────────────────────

export const EDL_COLORS = {
  brand: BRAND,
  surface: SURFACES,
  text: TEXT,
  border: BORDERS,
  status: STATUS,
  financial: FINANCIAL,
  risk: RISK,
  charts: CHARTS,
  ai: AI,
  shadow: SHADOWS,
  elevation: ELEVATION,
} as const;

export type EDLColorTokens = typeof EDL_COLORS;
