export type Locale = "en" | "ar";
export type Direction = "ltr" | "rtl";

export interface LocaleConfig {
  locale: Locale;
  label: string;
  nativeLabel: string;
  direction: Direction;
  dateFormat: string;
  timeFormat: string;
  currencyFormat: string;
  numberFormat: string;
  weekStartDay: 0 | 1 | 6;
  fiscalYearStart: string;
  decimalSeparator: string;
  groupingSeparator: string;
  currencyCode: string;
}

export interface TranslationValue {
  [key: string]: string | TranslationValue;
}

export interface TranslationNamespace {
  namespace: string;
  translations: TranslationValue;
}

export interface LocalePreferences {
  locale: Locale;
  numberFormat?: string;
  currencyFormat?: string;
  dateFormat?: string;
  timeFormat?: string;
  weekStartDay?: number;
  timezone?: string;
}

export const LOCALE_CONFIGS: Record<Locale, LocaleConfig> = {
  en: {
    locale: "en",
    label: "English",
    nativeLabel: "English",
    direction: "ltr",
    dateFormat: "MM/dd/yyyy",
    timeFormat: "h:mm a",
    currencyFormat: "symbol",
    numberFormat: "1,234,567.89",
    weekStartDay: 0,
    fiscalYearStart: "01-01",
    decimalSeparator: ".",
    groupingSeparator: ",",
    currencyCode: "USD",
  },
  ar: {
    locale: "ar",
    label: "Arabic",
    nativeLabel: "العربية",
    direction: "rtl",
    dateFormat: "dd/MM/yyyy",
    timeFormat: "h:mm a",
    currencyFormat: "symbol",
    numberFormat: "1.234.567,89",
    weekStartDay: 6,
    fiscalYearStart: "01-01",
    decimalSeparator: ",",
    groupingSeparator: ".",
    currencyCode: "SAR",
  },
};

export const SUPPORTED_LOCALES: Locale[] = ["en", "ar"];
export const DEFAULT_LOCALE: Locale = "en";

export const MENA_CURRENCIES = ["AED", "SAR", "QAR", "KWD", "BHD", "OMR", "EGP", "JOD"] as const;

export const FISCAL_PERIODS = {
  en: { startMonth: 1, startDay: 1, label: "Calendar Year" },
  ar: { startMonth: 1, startDay: 1, label: "السنة التقويمية" },
};
