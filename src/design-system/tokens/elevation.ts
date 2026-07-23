export const elevation = {
  surface1: {
    background: "#161618",
    border: "#2a2a2e",
    shadow: "0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.15)",
  },
  surface2: {
    background: "#1c1c1f",
    border: "#2a2a2e",
    shadow: "0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.15)",
  },
  surface3: {
    background: "#222225",
    border: "#333338",
    shadow: "0 2px 4px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  executive: {
    background: "#1a1a2e",
    border: "#2a2a3e",
    shadow: "0 2px 4px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(212, 168, 0, 0.05)",
  },
  hover: {
    background: "#222225",
    border: "#3a3a3e",
    shadow: "0 2px 4px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)",
  },
  surface: {
    background: "#1c1c1f",
    border: "#2a2a2e",
    shadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
  },
} as const;

export type ElevationToken = typeof elevation;
