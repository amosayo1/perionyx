export const radius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  "2xl": 16,
  full: 9999,

  // Semantic
  card: 8,
  button: 6,
  input: 6,
  dialog: 12,
  popover: 8,
  badge: 4,
  pill: 9999,
  sidebar: 0,
  table: 6,
} as const;

/** CSS-compatible px strings for direct style props */
export const radiusPx = {
  none: "0px",
  xs: "2px",
  sm: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
  "2xl": "16px",
  full: "9999px",
  card: "8px",
  button: "6px",
  input: "6px",
  dialog: "12px",
  popover: "8px",
  badge: "4px",
  pill: "9999px",
  sidebar: "0px",
  table: "6px",
} as const;

export type RadiusToken = typeof radius;
