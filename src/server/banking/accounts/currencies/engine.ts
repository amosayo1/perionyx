import type { CurrencyConfiguration, AccountCurrencyOverride } from "../types";

export const SUPPORTED_CURRENCIES = [
  "USD", "EUR", "GBP", "AED", "SAR", "JPY", "CNY", "HKD", "SGD",
  "AUD", "CAD", "CHF", "INR", "KRW", "SEK", "NOK", "DKK", "PLN",
  "ZAR", "NGN", "KES", "EGP", "BHD", "QAR", "KWD", "OMR", "MXN",
  "BRL", "TRY", "MYR", "THB", "VND", "PHP", "TWD", "NZD",
];

export class CurrencyEngine {
  private configs = new Map<string, CurrencyConfiguration>();

  configure(config: CurrencyConfiguration): void {
    this.configs.set(config.enterpriseId, config);
  }

  getConfiguration(enterpriseId: string): CurrencyConfiguration | undefined {
    return this.configs.get(enterpriseId);
  }

  getAccountCurrency(enterpriseId: string, accountId: string): string {
    const config = this.configs.get(enterpriseId);
    if (config) {
      const override = config.accountOverrides.find((o) => o.accountId === accountId);
      if (override) return override.accountCurrency;
    }
    return config?.baseCurrency ?? "USD";
  }

  getFunctionalCurrency(enterpriseId: string, accountId: string): string {
    const config = this.configs.get(enterpriseId);
    if (config) {
      const override = config.accountOverrides.find((o) => o.accountId === accountId);
      if (override) return override.functionalCurrency;
      return config.reportingCurrency;
    }
    return "USD";
  }

  setAccountOverride(enterpriseId: string, override: AccountCurrencyOverride): void {
    const config = this.configs.get(enterpriseId);
    if (!config) throw new Error(`No currency configuration for enterprise: ${enterpriseId}`);

    const existingIdx = config.accountOverrides.findIndex(
      (o) => o.accountId === override.accountId,
    );
    if (existingIdx >= 0) {
      config.accountOverrides[existingIdx] = override;
    } else {
      config.accountOverrides.push(override);
    }
  }

  removeAccountOverride(enterpriseId: string, accountId: string): void {
    const config = this.configs.get(enterpriseId);
    if (config) {
      config.accountOverrides = config.accountOverrides.filter(
        (o) => o.accountId !== accountId,
      );
    }
  }

  addReportingCurrency(enterpriseId: string, currency: string): void {
    const config = this.configs.get(enterpriseId);
    if (config && !config.additionalReportingCurrencies.includes(currency)) {
      config.additionalReportingCurrencies.push(currency);
    }
  }

  removeReportingCurrency(enterpriseId: string, currency: string): void {
    const config = this.configs.get(enterpriseId);
    if (config) {
      config.additionalReportingCurrencies = config.additionalReportingCurrencies.filter(
        (c) => c !== currency,
      );
    }
  }

  isSupportedCurrency(code: string): boolean {
    return SUPPORTED_CURRENCIES.includes(code.toUpperCase());
  }

  getConversionRate(from: string, to: string): number {
    if (from === to) return 1;
    return 0;
  }

  getAllConfigs(): CurrencyConfiguration[] {
    return Array.from(this.configs.values());
  }

  clear(): void {
    this.configs.clear();
  }
}

export const currencyEngine = new CurrencyEngine();