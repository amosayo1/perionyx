/**
 * Phase 22.0B — EDL Canonical Tokens — Barrel Export
 *
 * Import everything from '@/design-system/edl' for design token access.
 * This is the single import point for ALL design tokens.
 */

export { BRAND, SURFACES, TEXT, BORDERS, STATUS, FINANCIAL, RISK, CHARTS, AI, SHADOWS, ELEVATION, EDL_COLORS } from "./colors";
export type { EDLColorTokens } from "./colors";

export { FONT_FAMILY, FONT_SIZE, TYPOGRAPHY_CLASSES, FONT_WEIGHT, LINE_HEIGHT, TRACKING, NUMERIC } from "./typography";

export { SPACE, LAYOUT, SPACING_CLASSES } from "./spacing";

export { RADIUS, RADIUS_USE, RADIUS_CLASSES } from "./radius";

export { DURATION, EASING, REDUCED_MOTION, VARIANTS, MOTION_DIV } from "./motion";

export { Z } from "./z-index";

export { ICON_SIZE, ICON_STROKE, ICON_COLOR, FEATURE_ICONS } from "./icons";
export type { IconProps } from "./icons";

export { BUTTON, CARD, INPUT, BADGE, TABLE, DIALOG, TOAST, TOOLTIP, SKELETON } from "./components";
