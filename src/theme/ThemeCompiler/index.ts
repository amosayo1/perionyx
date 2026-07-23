import type { ThemeConfig } from "../types";

type CssVarMap = Record<string, string>;

function flattenTheme(theme: ThemeConfig): CssVarMap {
  return {
    "--perionyx-bg-primary": theme.backgrounds.primary,
    "--perionyx-bg-secondary": theme.backgrounds.secondary,
    "--perionyx-bg-surface": theme.backgrounds.surface,
    "--perionyx-bg-panel": theme.backgrounds.panel,
    "--perionyx-bg-panel-strong": theme.backgrounds.panelStrong,
    "--perionyx-bg-atmosphere": theme.backgrounds.atmosphere,
    "--perionyx-bg-elevated": theme.backgrounds.elevated,

    "--perionyx-border": theme.borders.default,
    "--perionyx-border-soft": theme.borders.soft,
    "--perionyx-border-muted": theme.borders.muted,
    "--perionyx-border-strong": theme.borders.strong,

    "--perionyx-text-primary": theme.text.primary,
    "--perionyx-text-muted": theme.text.muted,
    "--perionyx-text-subtle": theme.text.subtle,
    "--perionyx-text-faint": theme.text.faint,
    "--perionyx-text-inverse": theme.text.inverse,
    "--perionyx-text-link": theme.text.link,

    "--perionyx-accent": theme.accent.base,
    "--perionyx-accent-hover": theme.accent.hover,
    "--perionyx-accent-pressed": theme.accent.pressed,
    "--perionyx-accent-focus": theme.accent.focus,
    "--perionyx-accent-muted": theme.accent.muted,
    "--perionyx-accent-subtle": theme.accent.subtle,
    "--perionyx-accent-on": theme.accent.onAccent,

    "--perionyx-gold": theme.accent.base,
    "--perionyx-gold-soft": theme.accent.hover,
    "--perionyx-gold-deep": theme.accent.pressed,

    "--perionyx-success": theme.status.success,
    "--perionyx-warning": theme.status.warning,
    "--perionyx-error": theme.status.error,
    "--perionyx-info": theme.status.info,

    "--perionyx-chart-1": theme.charts.colors[0] || "#d4af37",
    "--perionyx-chart-2": theme.charts.colors[1] || "#5b8fc9",
    "--perionyx-chart-3": theme.charts.colors[2] || "#3ca16d",
    "--perionyx-chart-4": theme.charts.colors[3] || "#d4a72c",
    "--perionyx-chart-5": theme.charts.colors[4] || "#b56b5e",
    "--perionyx-chart-6": theme.charts.colors[5] || "#8b6bae",
    "--perionyx-chart-7": theme.charts.colors[6] || "#c97b5b",

    "--perionyx-shadow-soft": theme.shadows.soft,
    "--perionyx-shadow-panel": theme.shadows.panel,
    "--perionyx-shadow-lg": theme.shadows.large,

    "--perionyx-font-family": theme.typography.fontFamily,
    "--perionyx-font-size-base": theme.typography.fontSizeBase,
    "--perionyx-font-family-heading": theme.typography.headingFont,
    "--perionyx-font-family-mono": theme.typography.monospaceFont,

    "--perionyx-radius": theme.borderRadius,
  };
}

export function compileTheme(theme: ThemeConfig): string {
  const vars = flattenTheme(theme);
  const lines = Object.entries(vars).map(([key, value]) => `  ${key}: ${value};`);
  return `:root {\n${lines.join("\n")}\n}`;
}

export function compileThemeDiff(
  base: ThemeConfig,
  overrides: Partial<ThemeConfig>,
): string {
  const merged = deepMerge(base, overrides);
  return compileTheme(merged);
}

function deepMerge(base: ThemeConfig, overrides: Partial<ThemeConfig>): ThemeConfig {
  return {
    ...base,
    ...overrides,
    accent: { ...base.accent, ...overrides.accent },
    backgrounds: { ...base.backgrounds, ...overrides.backgrounds },
    borders: { ...base.borders, ...overrides.borders },
    text: { ...base.text, ...overrides.text },
    status: { ...base.status, ...overrides.status },
    charts: { ...base.charts, ...overrides.charts, colors: overrides.charts?.colors || base.charts.colors },
    shadows: { ...base.shadows, ...overrides.shadows },
    typography: { ...base.typography, ...overrides.typography },
  };
}

export function injectTheme(css: string): () => void {
  if (typeof document === "undefined") return () => {};

  const existing = document.getElementById("perionyx-theme-injected");
  if (existing) existing.remove();

  const style = document.createElement("style");
  style.id = "perionyx-theme-injected";
  style.textContent = css;
  document.head.appendChild(style);

  return () => {
    const el = document.getElementById("perionyx-theme-injected");
    if (el) el.remove();
  };
}

export function getActiveThemeVars(): Record<string, string> {
  if (typeof document === "undefined") return {};

  const style = getComputedStyle(document.documentElement);
  const vars: Record<string, string> = {};
  const prefixes = ["--perionyx-"];
  for (let i = 0; i < style.length; i++) {
    const name = style.item(i);
    if (prefixes.some((p) => name.startsWith(p))) {
      vars[name] = style.getPropertyValue(name).trim();
    }
  }
  return vars;
}
