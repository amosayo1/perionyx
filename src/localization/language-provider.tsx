import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import type { Locale, Direction, LocaleConfig, LocalePreferences } from "./types";
import { LOCALE_CONFIGS, DEFAULT_LOCALE } from "./types";
import { LanguageDetectionService } from "./locale-manager";
import { getTypographyForLocale } from "./typography";
import enMessages from "@/messages/en.json";
import arMessages from "@/messages/ar.json";

const TRANSLATIONS: Record<Locale, Record<string, any>> = { en: enMessages, ar: arMessages };

interface LocalizationContextValue {
  locale: Locale;
  direction: Direction;
  config: LocaleConfig;
  setLocale: (locale: Locale) => void;
  isRTL: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

export function useLocalization(): LocalizationContextValue {
  const ctx = useContext(LocalizationContext);
  if (!ctx) throw new Error("useLocalization must be used within LanguageProvider");
  return ctx;
}

export function useRTL(): boolean {
  return useLocalization().isRTL;
}

export function useDirection(): Direction {
  return useLocalization().direction;
}

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
  messages?: Record<string, any>;
}

function resolveValue(obj: any, path: string): string | undefined {
  return path.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), obj);
}

export function LanguageProvider({ children, initialLocale, messages }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (initialLocale) return initialLocale;
    try {
      return new LanguageDetectionService().detect();
    } catch {
      return DEFAULT_LOCALE;
    }
  });

  const translations = messages ?? TRANSLATIONS[locale];

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = LOCALE_CONFIGS[locale].direction;
      const profile = getTypographyForLocale(locale);
      document.documentElement.style.setProperty("--font-family-primary", profile.fontFamily);
    }
  }, [locale]);

  const setLocale = useCallback(
    (newLocale: Locale) => {
      setLocaleState(newLocale);
      try { localStorage.setItem("perionyx-locale", newLocale); } catch { /* ignore */ }
    },
    [],
  );

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      if (!translations) return key;
      const value = resolveValue(translations, key) as string | undefined;
      if (!value) return key;
      if (params) {
        return Object.entries(params).reduce((acc, [k, v]) => acc.replace(`{${k}}`, String(v)), value);
      }
      return value;
    },
    [translations],
  );

  const config = LOCALE_CONFIGS[locale];
  const direction = config.direction;
  const isRTL = direction === "rtl";

  const value = useMemo(
    () => ({ locale, direction, config, setLocale, isRTL, t }),
    [locale, direction, config, setLocale, isRTL, t],
  );

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}
