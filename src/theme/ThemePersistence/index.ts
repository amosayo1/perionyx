import type { ThemePreference, ThemePreferenceLevel } from "../types";

const STORAGE_KEY = "perionyx-theme-pref";
const STORAGE_LEVEL_KEY = "perionyx-theme-level";

export function getPersistedPreference(): ThemePreference | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ThemePreference) : null;
  } catch {
    return null;
  }
}

export function persistPreference(pref: Partial<ThemePreference>): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getPersistedPreference() || {
      themeId: "perionyx-dark",
      mode: "dark",
      reducedMotion: false,
      highContrast: false,
      fontScaling: 100,
    };
    const updated = { ...existing, ...pref };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    /* silently fail */
  }
}

export function persistPreferenceLevel(level: ThemePreferenceLevel): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_LEVEL_KEY, level);
  } catch {
    /* silently fail */
  }
}

export function getPersistedLevel(): ThemePreferenceLevel {
  if (typeof window === "undefined") return "user";
  try {
    return (localStorage.getItem(STORAGE_LEVEL_KEY) as ThemePreferenceLevel) || "user";
  } catch {
    return "user";
  }
}

export function clearPreferences(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_LEVEL_KEY);
  } catch {
    /* silently fail */
  }
}

export function getPreferenceHierarchy(
  userPref?: ThemePreference | null,
  orgPref?: ThemePreference | null,
  workspacePref?: ThemePreference | null,
): ThemePreference {
  const level = getPersistedLevel();
  if (level === "workspace" && workspacePref) return workspacePref;
  if (level === "organization" && orgPref) return orgPref;
  if (level === "user" && userPref) return userPref;
  return {
    themeId: "perionyx-dark",
    mode: "dark",
    reducedMotion: false,
    highContrast: false,
    fontScaling: 100,
  };
}
