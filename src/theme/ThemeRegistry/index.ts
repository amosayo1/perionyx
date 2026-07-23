import type { ThemeConfig, ThemeCategory, ThemeMode } from "../types";
import { SYSTEM_THEMES } from "../defaults";

const registeredThemes = new Map<string, ThemeConfig>();

export function getThemeById(id: string): ThemeConfig | undefined {
  const system = SYSTEM_THEMES.find((t) => t.id === id);
  if (system) return system;
  return registeredThemes.get(id);
}

export function registerTheme(theme: ThemeConfig): void {
  if (registeredThemes.has(theme.id)) {
    console.warn(`[ThemeRegistry] Theme "${theme.id}" already registered — overwriting`);
  }
  registeredThemes.set(theme.id, theme);
}

export function unregisterTheme(id: string): boolean {
  return registeredThemes.delete(id);
}

export function getAllThemes(category?: ThemeCategory): ThemeConfig[] {
  const system = SYSTEM_THEMES;
  const custom = Array.from(registeredThemes.values());
  if (category === "system") return system;
  if (category === "tenant" || category === "workspace" || category === "custom") {
    return custom.filter((t) => t.category === category);
  }
  return [...system, ...custom];
}

export function getThemesByMode(mode: ThemeMode): ThemeConfig[] {
  return getAllThemes().filter((t) => t.mode === mode);
}

export function getDefaultTheme(mode?: ThemeMode): ThemeConfig {
  if (mode === "light") return SYSTEM_THEMES[1];
  if (mode === "high-contrast") return SYSTEM_THEMES[2];
  return SYSTEM_THEMES[0];
}

export function clearRegisteredThemes(): void {
  registeredThemes.clear();
}
