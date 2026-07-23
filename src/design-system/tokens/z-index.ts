export const zIndex = {
  hide: -1,
  auto: "auto",
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  banner: 1050,
  overlay: 1080,
  modal: 1100,
  popover: 1120,
  tooltip: 1140,
  toast: 1160,
  sidebar: 1200,
  navbar: 1300,
  loading: 1400,
  max: 2147483647,
} as const;

export type ZIndexToken = typeof zIndex;
