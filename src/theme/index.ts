export { TenantThemeProvider, useTenantTheme } from "./TenantThemeProvider";
export type { TenantThemeContextValue } from "./TenantThemeProvider";

export { useThemePreview } from "./ThemePreview";

export { generateThemeFromAccent } from "./ColorGenerator";
export type { GeneratedTheme } from "./ColorGenerator";

export { validateTheme, validateAccentColor } from "./ThemeValidator";

export { compileTheme, compileThemeDiff, injectTheme, getActiveThemeVars } from "./ThemeCompiler";

export {
  getThemeById,
  registerTheme,
  unregisterTheme,
  getAllThemes,
  getThemesByMode,
  getDefaultTheme,
  clearRegisteredThemes,
} from "./ThemeRegistry";

export {
  getBranding,
  setBranding,
  deleteBranding,
  getAllBranding,
  validateBrandingConfig,
  brandDisplayName,
} from "./BrandingManager";

export {
  getCurrentTheme,
  setCurrentTheme,
  applyThemeById,
  applyThemeByMode,
  applyThemeForAccent,
  resetToDefault,
  onThemeChange,
  initThemeEngine,
} from "./ThemeEngine";

export {
  getPersistedPreference,
  persistPreference,
  persistPreferenceLevel,
  getPersistedLevel,
  clearPreferences,
  getPreferenceHierarchy,
} from "./ThemePersistence";

export {
  PERIONYX_DARK,
  PERIONYX_LIGHT,
  PERIONYX_HIGH_CONTRAST,
  PERIONYX_EXECUTIVE,
  SYSTEM_THEMES,
  DEFAULT_BRANDING,
} from "./defaults";

export type * from "./types";

export {
  parseHex,
  toHex,
  hexToRgb,
  hexToRgba,
  getLuminance,
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  lighten,
  darken,
  mix,
  hexToHsl,
  hslToHex,
  hslToString,
  getAccessibleVariant,
  generateChartPalette,
  generateStatusPalette,
  generateAccentPalette,
} from "./color-utils";
export type { AccentPaletteResult, ThemeStatusColors } from "./color-utils";
