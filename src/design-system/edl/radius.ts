/**
 * Phase 22.0B — EDL Canonical Radius Tokens
 *
 * Rounded corners. Restrained. Consistent. 3 levels: none, standard, full.
 */

export const RADIUS = {
  none: "0px",
  xs: "2px",
  sm: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
  "2xl": "16px",
  full: "9999px",
} as const;

export const RADIUS_USE = {
  /** Buttons, inputs, badges */
  control: RADIUS.md,
  /** Cards, panels, sections */
  card: RADIUS.lg,
  /** Modals, dialogs, popovers */
  dialog: RADIUS.xl,
  /** Tooltips, small popups */
  tooltip: RADIUS.sm,
  /** Avatars, status dots */
  avatar: RADIUS.full,
  /** Table rows — none */
  tableRow: RADIUS.none,
  /** Dropdowns, menus */
  dropdown: RADIUS.lg,
  /** Toasts, notifications */
  toast: RADIUS.lg,
  /** Charts, data visualizations */
  chart: RADIUS.sm,
  /** Tags, chips */
  tag: RADIUS.sm,
  /** Progress bars */
  progress: RADIUS.full,
} as const;

export const RADIUS_CLASSES = {
  none: "rounded-none",
  xs: "rounded-[2px]",
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
} as const;
