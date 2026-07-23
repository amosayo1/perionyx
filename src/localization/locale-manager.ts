import { useCallback, useEffect, useState } from "react";
import type { Locale, LocalePreferences } from "./types";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "./types";

const PREFS_KEY = "perionyx-locale-prefs";

export class LanguageDetectionService {
  detect(): Locale {
    if (typeof window === "undefined") return DEFAULT_LOCALE;

    const stored = localStorage.getItem("perionyx-locale") as Locale | null;
    if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;

    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("NEXT_LOCALE="));
    if (cookie) {
      const val = cookie.split("=")[1] as Locale;
      if (SUPPORTED_LOCALES.includes(val)) return val;
    }

    const browserLang = navigator.language?.split("-")[0] as Locale;
    if (SUPPORTED_LOCALES.includes(browserLang)) return browserLang;

    return DEFAULT_LOCALE;
  }

  getPreferredLanguages(): string[] {
    if (typeof window === "undefined") return ["en"];
    const langs = navigator.languages;
    return langs ? Array.from(langs) : [navigator.language ?? "en"];
  }

  isArabicPreferred(): boolean {
    return this.getPreferredLanguages().some((l) => l.startsWith("ar"));
  }
}

export function useLocalePreferences(): {
  preferences: LocalePreferences;
  updatePreference: <K extends keyof LocalePreferences>(key: K, value: LocalePreferences[K]) => void;
  resetPreferences: () => void;
} {
  const [preferences, setPreferences] = useState<LocalePreferences>(() => {
    if (typeof window === "undefined") return { locale: DEFAULT_LOCALE };
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      return stored ? (JSON.parse(stored) as LocalePreferences) : { locale: DEFAULT_LOCALE };
    } catch {
      return { locale: DEFAULT_LOCALE };
    }
  });

  useEffect(() => {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(preferences)); } catch { /* ignore */ }
  }, [preferences]);

  const updatePreference = useCallback(
    <K extends keyof LocalePreferences>(key: K, value: LocalePreferences[K]) => {
      setPreferences((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetPreferences = useCallback(() => {
    setPreferences({ locale: DEFAULT_LOCALE });
  }, []);

  return { preferences, updatePreference, resetPreferences };
}

export class TranslationValidationService {
  validateKeys(enTranslations: Record<string, any>, arTranslations: Record<string, any>): string[] {
    const missing: string[] = [];
    this.compareKeys(enTranslations, arTranslations, "", missing);
    return missing;
  }

  private compareKeys(
    source: Record<string, any>,
    target: Record<string, any>,
    prefix: string,
    missing: string[],
  ) {
    for (const key of Object.keys(source)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (typeof source[key] === "object" && source[key] !== null) {
        if (!target[key] || typeof target[key] !== "object") {
          missing.push(fullPath);
        } else {
          this.compareKeys(source[key], target[key], fullPath, missing);
        }
      } else if (typeof source[key] === "string") {
        if (!target[key] || typeof target[key] !== "string") {
          missing.push(fullPath);
        }
      }
    }
  }

  validateInterpolation(source: Record<string, any>): string[] {
    const issues: string[] = [];
    this.checkInterpolation(source, "", issues);
    return issues;
  }

  private checkInterpolation(
    obj: Record<string, any>,
    prefix: string,
    issues: string[],
  ) {
    for (const key of Object.keys(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "string") {
        const matches = obj[key].match(/\{[^}]+\}/g);
        if (matches) {
          matches.forEach((m) => {
            const varName = m.slice(1, -1);
            if (!varName.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
              issues.push(`Invalid interpolation variable "${m}" in "${fullPath}"`);
            }
          });
        }
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        this.checkInterpolation(obj[key], fullPath, issues);
      }
    }
  }
}
