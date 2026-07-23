export const surfaces = {
  background: "#141414",
  app: "#1a1a1a",

  surface0: "#1a1a1a",
  surface1: "#232323",
  surface2: "#2a2a2a",
  surface3: "#333333",

  glass: "rgba(35, 35, 35, 0.8)",
  elevated: "#232323",
  floating: "#2a2a2a",

  sidebar: "#141414",
  header: "rgba(20, 20, 20, 0.9)",
  card: "#232323",
  dropdown: "#2a2a2a",
  tooltip: "#333333",
  modal: "#232323",
  drawer: "#1a1a1a",

  input: "#1a1a1a",
  inputFocus: "#232323",
  tableRow: "transparent",
  tableRowHover: "rgba(255, 255, 255, 0.03)",
  tableRowSelected: "rgba(201, 168, 76, 0.08)",

  skeleton: "#2a2a2a",
  skeletonShine: "rgba(255, 255, 255, 0.04)",
} as const;

export type SurfaceToken = keyof typeof surfaces;
