export const colors = {
  // Backgrounds
  bg: {
    primary: "#0a0a0f",
    surface: "#111118",
    elevated: "#1a1a24",
    hover: "#222230",
    active: "#2a2a38",
    overlay: "rgba(0, 0, 0, 0.6)",
  },

  // Surfaces (card elevation)
  surface1: "#111118",
  surface2: "#1a1a24",
  surface3: "#222230",
  executive: "#1a1a2e",
  hover: "#222230",

  // Borders
  border: "rgba(255, 255, 255, 0.08)",
  borderStrong: "rgba(255, 255, 255, 0.12)",
  borderSubtle: "rgba(255, 255, 255, 0.04)",
  borderGold: "rgba(212, 175, 55, 0.2)",
  muted: "#111118",

  // Typography
  text: {
    primary: "#f7f6f2",
    secondary: "#a1a1aa",
    tertiary: "#71717a",
    disabled: "#52525b",
    inverse: "#0a0a0f",
    link: "#5e9eff",
    linkHover: "#7db1ff",
  },

  // Gold accent — used sparingly for executive metrics, KPIs, key actions
  gold: {
    50: "#fef9e7",
    100: "#fcf0c5",
    200: "#f9e59e",
    300: "#f5d970",
    400: "#f0c940",
    500: "#d4af37",
    600: "#d4af37",
    700: "#967a00",
    800: "#756100",
    900: "#544600",
    DEFAULT: "#d4af37",
    muted: "rgba(212, 175, 55, 0.15)",
    subtle: "rgba(212, 175, 55, 0.08)",
  },

  // Semantic colors
  success: {
    50: "#e8f8ed",
    100: "#c5efd4",
    200: "#9ee4b8",
    500: "#22c55e",
    700: "#15803d",
    900: "#0f4f2e",
    DEFAULT: "#22c55e",
    muted: "rgba(34, 197, 94, 0.15)",
    subtle: "rgba(34, 197, 94, 0.08)",
  },

  warning: {
    50: "#fef7e8",
    100: "#fdedc5",
    200: "#fce29e",
    500: "#f59e0b",
    700: "#b45309",
    900: "#7c3a00",
    DEFAULT: "#f59e0b",
    muted: "rgba(245, 158, 11, 0.15)",
    subtle: "rgba(245, 158, 11, 0.08)",
  },

  error: {
    50: "#fde8e8",
    100: "#fac5c5",
    200: "#f69e9e",
    500: "#ef4444",
    700: "#b91c1c",
    900: "#7f1d1d",
    DEFAULT: "#ef4444",
    muted: "rgba(239, 68, 68, 0.15)",
    subtle: "rgba(239, 68, 68, 0.08)",
  },

  info: {
    50: "#e8f0fd",
    100: "#c5daf9",
    200: "#9ec3f5",
    500: "#3b82f6",
    700: "#1d4ed8",
    900: "#1e3a8a",
    DEFAULT: "#3b82f6",
    muted: "rgba(59, 130, 246, 0.15)",
    subtle: "rgba(59, 130, 246, 0.08)",
  },

  neutral: {
    50: "#f5f5f5",
    100: "#e5e5e5",
    200: "#d4d4d4",
    300: "#a3a3a3",
    400: "#737373",
    500: "#525252",
    600: "#404040",
    700: "#333333",
    800: "#262626",
    900: "#171717",
    950: "#0a0a0a",
  },
} as const;

/** Unified design token object — single source of truth */
export const TOKENS = {
  color: {
    gold: "#d4af37",
    goldHover: "#e5c04a",
    goldMuted: "rgba(212, 175, 55, 0.15)",
    goldSubtle: "rgba(212, 175, 55, 0.08)",
    success: "#22c55e",
    successMuted: "rgba(34, 197, 94, 0.15)",
    warning: "#f59e0b",
    warningMuted: "rgba(245, 158, 11, 0.15)",
    danger: "#ef4444",
    dangerMuted: "rgba(239, 68, 68, 0.15)",
    info: "#3b82f6",
    infoMuted: "rgba(59, 130, 246, 0.15)",
  },
  surface: {
    primary: "#0a0a0f",
    secondary: "#111118",
    tertiary: "#1a1a24",
    elevated: "#222230",
    overlay: "rgba(0, 0, 0, 0.6)",
  },
  border: {
    default: "rgba(255, 255, 255, 0.08)",
    strong: "rgba(255, 255, 255, 0.12)",
    subtle: "rgba(255, 255, 255, 0.04)",
    gold: "rgba(212, 175, 55, 0.2)",
  },
  text: {
    primary: "#f7f6f2",
    secondary: "#a1a1aa",
    tertiary: "#71717a",
    disabled: "#52525b",
    inverse: "#0a0a0f",
  },
  shadow: {
    soft: "0 1px 3px rgba(0, 0, 0, 0.3)",
    medium: "0 4px 12px rgba(0, 0, 0, 0.4)",
    large: "0 8px 24px rgba(0, 0, 0, 0.5)",
    glowGold: "0 0 20px rgba(212, 175, 55, 0.15)",
    glowSuccess: "0 0 20px rgba(34, 197, 94, 0.15)",
    glowDanger: "0 0 20px rgba(239, 68, 68, 0.15)",
  },
  space: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
  },
} as const;

export type ColorToken = typeof colors;
export type Tokens = typeof TOKENS;
