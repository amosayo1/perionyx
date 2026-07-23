import type { ThemeConfig, ThemeMode } from "../types";
import { generateAccentPalette, generateChartPalette, generateStatusPalette, getAccessibleVariant, hexToRgba } from "../color-utils";
import { validateTheme } from "../ThemeValidator";
import type { ThemeValidationResult } from "../types";

export interface GeneratedTheme extends ThemeConfig {
  validation: ThemeValidationResult;
}

export function generateThemeFromAccent(
  accent: string,
  mode: ThemeMode,
  name: string,
  id?: string,
): GeneratedTheme {
  const effectiveMode: "light" | "dark" = mode === "light" ? "light" : "dark";
  const isDark = effectiveMode === "dark";
  const bgPrimary = isDark ? "#040404" : "#ffffff";
  const bgSecondary = isDark ? "#090909" : "#f8f8f6";

  const accentPalette = generateAccentPalette(accent, effectiveMode);
  const statusColors = generateStatusPalette(accent, effectiveMode);
  const chartColors = generateChartPalette(accent);

  const textOnBg = getAccessibleVariant(isDark ? "#f7f6f2" : "#1a1a18", bgPrimary);

  const theme: ThemeConfig = {
    id: id || `generated-${Date.now()}`,
    name,
    mode,
    category: "custom",
    accent: accentPalette,
    backgrounds: {
      primary: bgPrimary,
      secondary: bgSecondary,
      surface: isDark ? "#121212" : "#f0efec",
      panel: isDark ? "#0d0d0d" : "#f5f4f1",
      panelStrong: isDark ? "#080808" : "#fafaf8",
      elevated: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
      atmosphere: hexToRgba(accent, isDark ? 0.08 : 0.06),
    },
    borders: {
      default: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
      soft: hexToRgba(accent, isDark ? 0.14 : 0.18),
      muted: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)",
      strong: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.16)",
    },
    text: {
      primary: textOnBg,
      muted: isDark ? "#b8b5ae" : "#55534e",
      subtle: isDark ? "#8f8a81" : "#807d76",
      faint: isDark ? "#6c6b67" : "#a09d96",
      inverse: isDark ? "#000000" : "#ffffff",
      link: accentPalette.base,
    },
    status: statusColors,
    charts: { colors: chartColors },
    shadows: {
      soft: isDark
        ? "0 30px 90px rgba(0,0,0,0.44)"
        : "0 30px 90px rgba(0,0,0,0.08)",
      panel: isDark
        ? "0 18px 48px rgba(0,0,0,0.45)"
        : "0 18px 48px rgba(0,0,0,0.06)",
      large: isDark
        ? "0 40px 120px rgba(0,0,0,0.5)"
        : "0 40px 120px rgba(0,0,0,0.1)",
      popover: isDark
        ? "0 12px 36px rgba(0,0,0,0.5)"
        : "0 12px 36px rgba(0,0,0,0.12)",
      modal: isDark
        ? "0 24px 64px rgba(0,0,0,0.6)"
        : "0 24px 64px rgba(0,0,0,0.18)",
    },
    typography: {
      fontFamily: "Inter, 'Geist Sans', ui-sans-serif, system-ui, sans-serif",
      fontSizeBase: "0.8125rem",
      headingFont: "Inter, 'Geist Sans', ui-sans-serif, system-ui, sans-serif",
      monospaceFont: "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace",
    },
    borderRadius: "0.75rem",
  };

  const validation = validateTheme(theme);

  return { ...theme, validation };
}
