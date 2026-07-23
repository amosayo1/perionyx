import type { ThemeConfig, ThemeMode } from "../types";
import { PERIONYX_DARK, PERIONYX_LIGHT, PERIONYX_HIGH_CONTRAST, PERIONYX_EXECUTIVE } from "../defaults";
import { generateThemeFromAccent } from "../ColorGenerator";
import { registerTheme, getThemeById } from "../ThemeRegistry";
import type { GeneratedTheme } from "../ColorGenerator";
import { compileTheme, injectTheme } from "../ThemeCompiler";
import { getPersistedPreference } from "../ThemePersistence";

export type ThemeEngineListener = (theme: ThemeConfig) => void;

let currentTheme: ThemeConfig = PERIONYX_DARK;
const listeners = new Set<ThemeEngineListener>();

export function getCurrentTheme(): ThemeConfig {
  return currentTheme;
}

export function setCurrentTheme(theme: ThemeConfig): void {
  currentTheme = theme;
  applyThemeCss(theme);
  listeners.forEach((fn) => fn(theme));
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme.id);
    document.documentElement.setAttribute("data-theme-mode", theme.mode);
  }
}

export function applyThemeById(id: string): ThemeConfig | null {
  const theme = getThemeById(id);
  if (!theme) {
    console.warn(`[ThemeEngine] Theme "${id}" not found`);
    return null;
  }
  setCurrentTheme(theme);
  return theme;
}

export function applyThemeByMode(mode: ThemeMode): ThemeConfig {
  if (mode === "dark") return applyThemeById("perionyx-dark") || PERIONYX_DARK;
  if (mode === "light") return applyThemeById("perionyx-light") || PERIONYX_LIGHT;
  if (mode === "high-contrast") return applyThemeById("perionyx-hc") || PERIONYX_HIGH_CONTRAST;
  return applyThemeById("perionyx-executive") || PERIONYX_EXECUTIVE;
}

export function applyThemeForAccent(
  accent: string,
  mode: "light" | "dark" | "high-contrast" = "dark",
  name?: string,
): GeneratedTheme {
  const generated = generateThemeFromAccent(accent, mode, name || "Custom Theme");
  registerTheme(generated);
  setCurrentTheme(generated);
  return generated;
}

export function resetToDefault(): ThemeConfig {
  return applyThemeById("perionyx-dark") || PERIONYX_DARK;
}

export function onThemeChange(fn: ThemeEngineListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

let cleanupInjected: (() => void) | null = null;

function applyThemeCss(theme: ThemeConfig): void {
  if (cleanupInjected) {
    cleanupInjected();
    cleanupInjected = null;
  }
  const css = compileTheme(theme);
  cleanupInjected = injectTheme(css);
}

export function initThemeEngine(initialThemeId?: string): ThemeConfig {
  const saved = getPersistedPreference();
  const themeId = initialThemeId || saved?.themeId || "perionyx-dark";
  const theme = applyThemeById(themeId);
  return theme || PERIONYX_DARK;
}
