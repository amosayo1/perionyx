"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { ThemeConfig, ThemeMode, ThemePreference, BrandingConfig } from "../types";
import { PERIONYX_DARK } from "../defaults";
import { getThemeById } from "../ThemeRegistry";
import { setCurrentTheme, applyThemeById, onThemeChange, resetToDefault, applyThemeByMode } from "../ThemeEngine";
import { getPersistedPreference, persistPreference } from "../ThemePersistence";
import { setBranding as setOrgBranding } from "../BrandingManager";

export interface TenantThemeContextValue {
  theme: ThemeConfig;
  isDark: boolean;
  isLight: boolean;
  isHighContrast: boolean;
  isExecutive: boolean;
  setTheme: (theme: ThemeConfig) => void;
  setThemeById: (id: string) => void;
  setMode: (mode: ThemeMode) => void;
  reset: () => void;
  branding: BrandingConfig | null;
  setBranding: (branding: BrandingConfig) => void;
  preference: ThemePreference;
  setPreference: (pref: Partial<ThemePreference>) => void;
}

const TenantThemeContext = createContext<TenantThemeContextValue | null>(null);

export function useTenantTheme(): TenantThemeContextValue {
  const ctx = useContext(TenantThemeContext);
  if (!ctx) {
    throw new Error("useTenantTheme must be used within TenantThemeProvider");
  }
  return ctx;
}

const DEFAULT_PREF: ThemePreference = {
  themeId: "perionyx-dark",
  mode: "dark",
  reducedMotion: false,
  highContrast: false,
  fontScaling: 100,
};

export function TenantThemeProvider({
  children,
  initialThemeId,
  initialBranding,
}: {
  children: ReactNode;
  initialThemeId?: string;
  initialBranding?: BrandingConfig;
}) {
  const savedPref = getPersistedPreference();
  const initialId = initialThemeId || savedPref?.themeId || "perionyx-dark";
  const found = getThemeById(initialId);
  const initialTheme: ThemeConfig = found || PERIONYX_DARK;

  const [theme, setThemeState] = useState<ThemeConfig>(initialTheme);
  const [branding, setBrandingState] = useState<BrandingConfig | null>(initialBranding || null);
  const [preference, setPreferenceState] = useState<ThemePreference>(
    savedPref || DEFAULT_PREF,
  );

  useEffect(() => {
    setCurrentTheme(initialTheme);
    const unsub = onThemeChange((t) => {
      setThemeState((prev) => (prev === t ? prev : t));
    });
    return unsub;
  }, []);

  const setTheme = useCallback((t: ThemeConfig) => {
    setCurrentTheme(t);
    persistPreference({ themeId: t.id, mode: t.mode });
  }, []);

  const setThemeById = useCallback((id: string) => {
    const t = applyThemeById(id);
    if (t) {
      persistPreference({ themeId: t.id, mode: t.mode });
    }
  }, []);

  const setMode = useCallback((mode: ThemeMode) => {
    applyThemeByMode(mode);
    persistPreference({ mode });
  }, []);

  const reset = useCallback(() => {
    resetToDefault();
    persistPreference({ themeId: "perionyx-dark", mode: "dark" });
  }, []);

  const setBranding = useCallback((b: BrandingConfig) => {
    setBrandingState(b);
    setOrgBranding("current", b);
  }, []);

  const setPreference = useCallback((pref: Partial<ThemePreference>) => {
    setPreferenceState((prev) => {
      const next = { ...prev, ...pref };
      persistPreference(next);
      return next;
    });
  }, []);

  const value: TenantThemeContextValue = {
    theme,
    isDark: theme.mode === "dark",
    isLight: theme.mode === "light",
    isHighContrast: theme.mode === "high-contrast",
    isExecutive: theme.id === "perionyx-executive",
    setTheme,
    setThemeById,
    setMode,
    reset,
    branding,
    setBranding,
    preference,
    setPreference,
  };

  return (
    <TenantThemeContext.Provider value={value}>
      {children}
    </TenantThemeContext.Provider>
  );
}