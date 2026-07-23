export const iconography = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },

  strokeWidth: {
    thin: 1.5,
    normal: 2,
    thick: 2.5,
  },

  padding: {
    icon: 4,
    iconButton: 6,
  },
} as const;

export type IconographyToken = typeof iconography;
