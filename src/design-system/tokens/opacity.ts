export const opacity = {
  full: 1,
  high: 0.9,
  medium: 0.7,
  low: 0.5,
  faint: 0.3,
  ghost: 0.15,
  invisible: 0,
  disabled: 0.4,
  overlay: 0.6,
  shimmer: 0.1,
} as const;

export type OpacityToken = typeof opacity;
