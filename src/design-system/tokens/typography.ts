export const fontFamily = {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Code', monospace",
} as const;

export const typography = {
  fontFamily: {
    ...fontFamily,
    metric: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  fontSize: {
    display: ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: 700 }],
    executiveHeading: ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: 700 }],
    pageHeading: ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.02em", fontWeight: 600 }],
    sectionHeading: ["1.125rem", { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: 600 }],
    cardHeading: ["1rem", { lineHeight: "1.5", letterSpacing: "-0.01em", fontWeight: 600 }],
    body: ["0.875rem", { lineHeight: "1.6", letterSpacing: "0em", fontWeight: 400 }],
    bodySmall: ["0.8125rem", { lineHeight: "1.5", letterSpacing: "0em", fontWeight: 400 }],
    caption: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.01em", fontWeight: 400 }],
    metric: ["2rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: 700 }],
    metricLabel: ["0.75rem", { lineHeight: "1.3", letterSpacing: "0.04em", fontWeight: 500, textTransform: "uppercase" }],
    code: ["0.8125rem", { lineHeight: "1.5", letterSpacing: "0em", fontWeight: 400 }],
    navigation: ["0.8125rem", { lineHeight: "1.3", letterSpacing: "0.01em", fontWeight: 500 }],
    tab: ["0.8125rem", { lineHeight: "1.3", letterSpacing: "0.02em", fontWeight: 500 }],
    button: ["0.875rem", { lineHeight: "1", letterSpacing: "0.01em", fontWeight: 500 }],
    badge: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.03em", fontWeight: 600, textTransform: "uppercase" }],
    overline: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.06em", fontWeight: 600, textTransform: "uppercase" }],
    tooltip: ["0.75rem", { lineHeight: "1.3", letterSpacing: "0em", fontWeight: 400 }],
  },
} as const;

export type TypographyToken = typeof typography;

export const typographyClasses = {
  display: "text-[2.5rem] leading-[1.1] tracking-[-0.03em] font-bold",
  executiveHeading: "text-[1.75rem] leading-[1.2] tracking-[-0.02em] font-bold",
  pageHeading: "text-[1.5rem] leading-[1.25] tracking-[-0.02em] font-semibold",
  sectionHeading: "text-[1.125rem] leading-[1.4] tracking-[-0.01em] font-semibold",
  cardHeading: "text-base leading-[1.5] tracking-[-0.01em] font-semibold",
  body: "text-sm leading-[1.6] font-normal",
  bodySmall: "text-[0.8125rem] leading-[1.5] font-normal",
  caption: "text-xs leading-[1.4] tracking-[0.01em] font-normal",
  metric: "text-[2rem] leading-[1.1] tracking-[-0.02em] font-bold",
  metricLabel: "text-xs leading-[1.3] tracking-[0.04em] font-medium uppercase",
  code: "text-[0.8125rem] leading-[1.5] font-normal font-mono",
  navigation: "text-[0.8125rem] leading-[1.3] tracking-[0.01em] font-medium",
  tab: "text-[0.8125rem] leading-[1.3] tracking-[0.02em] font-medium",
  button: "text-sm leading-none tracking-[0.01em] font-medium",
  badge: "text-[0.6875rem] leading-none tracking-[0.03em] font-semibold uppercase",
  overline: "text-[0.6875rem] leading-none tracking-[0.06em] font-semibold uppercase",
  tooltip: "text-xs leading-[1.3] font-normal",
} as const;
