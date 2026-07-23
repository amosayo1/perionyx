export const shadows = {
  soft: "0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.15)",
  medium: "0 2px 4px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)",
  large: "0 4px 8px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.25)",
  floating: "0 8px 16px rgba(0, 0, 0, 0.35), 0 16px 48px rgba(0, 0, 0, 0.3)",
  popover: "0 4px 12px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.3)",
  modal: "0 12px 24px rgba(0, 0, 0, 0.5), 0 24px 64px rgba(0, 0, 0, 0.4)",
  dialog: "0 16px 32px rgba(0, 0, 0, 0.5), 0 32px 80px rgba(0, 0, 0, 0.4)",
  sidebar: "4px 0 8px rgba(0, 0, 0, 0.3)",
  toast: "0 4px 12px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.3)",
  card: "0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.15)",
  cardHover: "0 4px 8px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.2)",
  button: "0 1px 2px rgba(0, 0, 0, 0.3)",
  glow: {
    gold: "0 0 20px rgba(212, 168, 0, 0.15), 0 0 40px rgba(212, 168, 0, 0.05)",
    success: "0 0 20px rgba(34, 197, 94, 0.15)",
    error: "0 0 20px rgba(239, 68, 68, 0.15)",
    info: "0 0 20px rgba(59, 130, 246, 0.15)",
  },
} as const;

export type ShadowToken = typeof shadows;
