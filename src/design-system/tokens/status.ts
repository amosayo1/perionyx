export const status = {
  success: {
    text: "#22c55e",
    bg: "rgba(34, 197, 94, 0.1)",
    border: "rgba(34, 197, 94, 0.3)",
    dot: "#22c55e",
  },
  warning: {
    text: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.1)",
    border: "rgba(245, 158, 11, 0.3)",
    dot: "#f59e0b",
  },
  error: {
    text: "#ef4444",
    bg: "rgba(239, 68, 68, 0.1)",
    border: "rgba(239, 68, 68, 0.3)",
    dot: "#ef4444",
  },
  info: {
    text: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.1)",
    border: "rgba(59, 130, 246, 0.3)",
    dot: "#3b82f6",
  },
  neutral: {
    text: "#808080",
    bg: "rgba(128, 128, 128, 0.1)",
    border: "rgba(128, 128, 128, 0.2)",
    dot: "#808080",
  },
  gold: {
    text: "#d4af37",
    bg: "rgba(201, 168, 76, 0.1)",
    border: "rgba(201, 168, 76, 0.3)",
    dot: "#d4af37",
  },
} as const;

export type StatusToken = keyof typeof status;
