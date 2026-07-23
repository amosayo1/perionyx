import { useCallback, useMemo } from "react";
import type { Locale, LocaleConfig } from "./types";
import { LOCALE_CONFIGS } from "./types";

const localeToIntl: Record<string, string> = {
  en: "en-US",
  ar: "ar-SA",
};

export class DateLocalizationService {
  private locale: Locale;
  private config: LocaleConfig;

  constructor(locale: Locale) {
    this.locale = locale;
    this.config = LOCALE_CONFIGS[locale];
  }

  formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    const intlLocale = localeToIntl[this.locale] ?? "en-US";
    return d.toLocaleDateString(intlLocale, options ?? {
      year: "numeric", month: "short", day: "numeric",
    });
  }

  formatTime(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    const intlLocale = localeToIntl[this.locale] ?? "en-US";
    return d.toLocaleTimeString(intlLocale, options ?? {
      hour: "numeric", minute: "2-digit",
    });
  }

  formatDateTime(date: Date | string | number): string {
    return `${this.formatDate(date)} ${this.formatTime(date)}`;
  }

  formatRelative(date: Date | string | number): string {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return this.locale === "ar" ? "الآن" : "just now";
    if (diffMin < 60) return this.locale === "ar" ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`;
    if (diffHrs < 24) return this.locale === "ar" ? `منذ ${diffHrs} ساعة` : `${diffHrs}h ago`;
    if (diffDays < 7) return this.locale === "ar" ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
    return this.formatDate(d);
  }

  formatFiscalPeriod(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    if (this.config.fiscalYearStart === "01-01") {
      return this.locale === "ar" ? `Q${Math.ceil(month / 3)} ${year}` : `Q${Math.ceil(month / 3)} ${year}`;
    }
    const fiscalStartMonth = parseInt(this.config.fiscalYearStart.split("-")[0]!, 10);
    const adjustedMonth = month >= fiscalStartMonth ? month : month + 12;
    const fy = month >= fiscalStartMonth ? year + 1 : year;
    return this.locale === "ar" ? `Q${Math.ceil(adjustedMonth / 3)} ${fy}` : `Q${Math.ceil(adjustedMonth / 3)} FY${fy}`;
  }

  weekStartDay(): number {
    return this.config.weekStartDay;
  }
}

export class CurrencyLocalizationService {
  private locale: Locale;

  constructor(locale: Locale) {
    this.locale = locale;
  }

  format(amount: number, currencyCode = "USD", compact = true): string {
    const intlLocale = localeToIntl[this.locale] ?? "en-US";
    if (compact && Math.abs(amount) >= 1_000_000) {
      return `${amount < 0 ? "-" : ""}${this.locale === "ar" ? "د.م." : "$"}${(Math.abs(amount) / 1_000_000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  formatVAT(amount: number, rate = 15): string {
    const vat = amount * (rate / 100);
    const intlLocale = localeToIntl[this.locale] ?? "en-US";
    if (this.locale === "ar") {
      return `ضريبة القيمة المضافة: ${new Intl.NumberFormat(intlLocale, { style: "currency", currency: "SAR" }).format(vat)} (${rate}%)`;
    }
    return `VAT: ${new Intl.NumberFormat(intlLocale, { style: "currency", currency: "USD" }).format(vat)} (${rate}%)`;
  }

  formatNegative(amount: number, currencyCode = "USD"): string {
    const formatted = this.format(Math.abs(amount), currencyCode, false);
    if (this.locale === "ar") {
      return `(${formatted})`;
    }
    return amount < 0 ? `(${formatted})` : formatted;
  }
}

export class NumberFormattingService {
  private locale: Locale;

  constructor(locale: Locale) {
    this.locale = locale;
  }

  format(value: number, decimals = 2): string {
    const intlLocale = localeToIntl[this.locale] ?? "en-US";
    return new Intl.NumberFormat(intlLocale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  formatPercent(value: number, decimals = 1): string {
    const intlLocale = localeToIntl[this.locale] ?? "en-US";
    return new Intl.NumberFormat(intlLocale, {
      style: "percent",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  }

  formatCompact(value: number): string {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return this.format(value, 0);
  }

  decimalSeparator(): string {
    return this.locale === "ar" ? "٫" : ".";
  }

  groupingSeparator(): string {
    return this.locale === "ar" ? "٬" : ",";
  }
}

export function useDateLocalization(locale: Locale): DateLocalizationService {
  return useMemo(() => new DateLocalizationService(locale), [locale]);
}

export function useCurrencyLocalization(locale: Locale): CurrencyLocalizationService {
  return useMemo(() => new CurrencyLocalizationService(locale), [locale]);
}

export function useNumberFormatting(locale: Locale): NumberFormattingService {
  return useMemo(() => new NumberFormattingService(locale), [locale]);
}
