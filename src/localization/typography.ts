import type { Locale } from "@/localization/types";

export interface TypographyProfile {
  fontFamily: string;
  fontFamilyArabic: string;
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
    loose: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
  };
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
  };
  locale: Locale;
}

export const TYPOGRAPHY_PROFILES: Record<string, TypographyProfile> = {
  en: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontFamilyArabic: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    lineHeight: { tight: "1.25", normal: "1.5", relaxed: "1.625", loose: "2" },
    fontSize: { xs: "11px", sm: "12px", base: "13px", lg: "15px", xl: "18px", "2xl": "22px", "3xl": "28px" },
    fontWeight: { normal: "400", medium: "500", semibold: "600", bold: "700" },
    letterSpacing: { tight: "-0.01em", normal: "0", wide: "0.02em", wider: "0.05em", widest: "0.1em" },
    locale: "en",
  },
  ar: {
    fontFamily: "'Noto Kufi Arabic', 'Tajawal', 'Cairo', 'Segoe UI', sans-serif",
    fontFamilyArabic: "'Noto Kufi Arabic', 'Tajawal', 'Cairo', 'Segoe UI', sans-serif",
    lineHeight: { tight: "1.35", normal: "1.6", relaxed: "1.75", loose: "2.2" },
    fontSize: { xs: "12px", sm: "13px", base: "14px", lg: "16px", xl: "20px", "2xl": "24px", "3xl": "30px" },
    fontWeight: { normal: "400", medium: "500", semibold: "600", bold: "700" },
    letterSpacing: { tight: "0", normal: "0", wide: "0.01em", wider: "0.03em", widest: "0.05em" },
    locale: "ar",
  },
};

export function getTypographyForLocale(locale: Locale): TypographyProfile {
  return TYPOGRAPHY_PROFILES[locale] ?? TYPOGRAPHY_PROFILES.en;
}

export const ARABIC_FONT_STACK = "'Noto Kufi Arabic', 'Tajawal', 'Cairo', 'Segoe UI', sans-serif";
export const ARABIC_FONT_SIZE_ADJUSTMENT = 1.08;
