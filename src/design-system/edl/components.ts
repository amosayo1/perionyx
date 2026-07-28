/**
 * Phase 22.0B — EDL Canonical Component Tokens
 *
 * Pre-composed design tokens for common UI components.
 * Each entry defines background, text, border, and shadow for a component state.
 */

import { SURFACES, BORDERS, TEXT, BRAND, SHADOWS, STATUS } from "./colors";
import { RADIUS_USE } from "./radius";

// ── Button ───────────────────────────────────────────────────────────────────

export const BUTTON = {
  primary: {
    bg: BRAND.gold,
    bgHover: BRAND.goldHover,
    bgActive: BRAND.goldActive,
    text: "#0a0a0f",
    border: "transparent",
    shadow: "none",
    shadowHover: SHADOWS.glowGold,
  },
  secondary: {
    bg: "transparent",
    bgHover: SURFACES.elevated,
    bgActive: SURFACES.floating,
    text: TEXT.primary,
    border: BORDERS.default,
    borderHover: BORDERS.strong,
    shadow: "none",
  },
  ghost: {
    bg: "transparent",
    bgHover: SURFACES.elevated,
    bgActive: SURFACES.floating,
    text: TEXT.secondary,
    border: "transparent",
    shadow: "none",
  },
  danger: {
    bg: STATUS.error.DEFAULT,
    bgHover: STATUS.error.hover,
    bgActive: "#b91c1c",
    text: "#ffffff",
    border: "transparent",
    shadow: "none",
  },
  disabled: {
    bg: SURFACES.elevated,
    text: TEXT.disabled,
    border: BORDERS.subtle,
    cursor: "not-allowed",
  },
} as const;

// ── Card ─────────────────────────────────────────────────────────────────────

export const CARD = {
  default: {
    bg: SURFACES.raised,
    border: BORDERS.default,
    shadow: SHADOWS.soft,
    radius: RADIUS_USE.card,
    padding: "20px",
  },
  elevated: {
    bg: SURFACES.elevated,
    border: BORDERS.default,
    shadow: SHADOWS.medium,
    radius: RADIUS_USE.card,
    padding: "20px",
  },
  interactive: {
    bg: SURFACES.raised,
    border: BORDERS.default,
    borderHover: BORDERS.strong,
    shadow: SHADOWS.soft,
    shadowHover: SHADOWS.medium,
    radius: RADIUS_USE.card,
    padding: "20px",
    transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
  selected: {
    bg: SURFACES.raised,
    border: BORDERS.gold,
    shadow: SHADOWS.glowGold,
    radius: RADIUS_USE.card,
    padding: "20px",
  },
  metric: {
    bg: SURFACES.raised,
    border: BORDERS.default,
    shadow: SHADOWS.soft,
    radius: RADIUS_USE.card,
    padding: "20px",
    /** Gold left border for primary metrics */
    accentBorder: `3px solid ${BRAND.gold}`,
  },
} as const;

// ── Input / Select ───────────────────────────────────────────────────────────

export const INPUT = {
  default: {
    bg: SURFACES.base,
    border: BORDERS.default,
    borderHover: BORDERS.strong,
    text: TEXT.primary,
    placeholder: TEXT.tertiary,
    radius: RADIUS_USE.control,
  },
  focus: {
    bg: SURFACES.base,
    border: BRAND.goldBorder,
    borderFocus: BRAND.goldFocus,
    text: TEXT.primary,
    shadow: `0 0 0 1px ${BRAND.goldFocus}`,
    radius: RADIUS_USE.control,
  },
  error: {
    bg: SURFACES.base,
    border: STATUS.error.border,
    text: TEXT.primary,
    shadow: `0 0 0 1px ${STATUS.error.border}`,
    radius: RADIUS_USE.control,
  },
  disabled: {
    bg: SURFACES.elevated,
    border: BORDERS.subtle,
    text: TEXT.disabled,
    cursor: "not-allowed",
    radius: RADIUS_USE.control,
  },
} as const;

// ── Badge / Tag ──────────────────────────────────────────────────────────────

export const BADGE = {
  default: {
    bg: SURFACES.elevated,
    text: TEXT.secondary,
    border: BORDERS.default,
  },
  gold: {
    bg: BRAND.goldMuted,
    text: BRAND.gold,
    border: BRAND.goldBorder,
  },
  success: {
    bg: STATUS.success.muted,
    text: STATUS.success.text,
    border: STATUS.success.border,
  },
  warning: {
    bg: STATUS.warning.muted,
    text: STATUS.warning.text,
    border: STATUS.warning.border,
  },
  error: {
    bg: STATUS.error.muted,
    text: STATUS.error.text,
    border: STATUS.error.border,
  },
  info: {
    bg: STATUS.info.muted,
    text: STATUS.info.text,
    border: STATUS.info.border,
  },
} as const;

// ── Table ────────────────────────────────────────────────────────────────────

export const TABLE = {
  header: {
    bg: SURFACES.raised,
    text: TEXT.secondary,
    border: BORDERS.default,
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.02em",
    textTransform: "uppercase" as const,
  },
  row: {
    bg: "transparent",
    bgHover: "rgba(255, 255, 255, 0.03)",
    bgSelected: "rgba(212, 175, 55, 0.08)",
    border: BORDERS.subtle,
  },
  cell: {
    text: TEXT.primary,
    textSecondary: TEXT.secondary,
    fontSize: "0.875rem",
    padding: "12px",
  },
} as const;

// ── Dialog / Modal ───────────────────────────────────────────────────────────

export const DIALOG = {
  backdrop: SURFACES.overlay,
  content: {
    bg: SURFACES.raised,
    border: BORDERS.strong,
    shadow: SHADOWS.floating,
    radius: RADIUS_USE.dialog,
    padding: "24px",
  },
  header: {
    text: TEXT.primary,
    fontSize: "1.25rem",
    fontWeight: 600,
  },
  body: {
    text: TEXT.secondary,
    fontSize: "0.875rem",
    lineHeight: "1.625",
  },
} as const;

// ── Toast / Notification ─────────────────────────────────────────────────────

export const TOAST = {
  success: {
    bg: SURFACES.raised,
    border: STATUS.success.border,
    icon: STATUS.success.text,
    text: TEXT.primary,
  },
  error: {
    bg: SURFACES.raised,
    border: STATUS.error.border,
    icon: STATUS.error.text,
    text: TEXT.primary,
  },
  warning: {
    bg: SURFACES.raised,
    border: STATUS.warning.border,
    icon: STATUS.warning.text,
    text: TEXT.primary,
  },
  info: {
    bg: SURFACES.raised,
    border: STATUS.info.border,
    icon: STATUS.info.text,
    text: TEXT.primary,
  },
} as const;

// ── Tooltip ──────────────────────────────────────────────────────────────────

export const TOOLTIP = {
  bg: SURFACES.floating,
  text: TEXT.primary,
  border: BORDERS.strong,
  shadow: SHADOWS.medium,
  radius: RADIUS_USE.tooltip,
  fontSize: "0.75rem",
  padding: "6px 10px",
  maxWidth: "280px",
} as const;

// ── Skeleton ─────────────────────────────────────────────────────────────────

export const SKELETON = {
  bg: SURFACES.elevated,
  shimmer: "rgba(255, 255, 255, 0.04)",
  radius: RADIUS_USE.control,
} as const;
