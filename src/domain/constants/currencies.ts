/** ISO 4217 codes accepted for wallet / ledger currency fields. */
export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP"] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_LEDGER_CURRENCY: SupportedCurrency = "USD";

export function isSupportedCurrency(code: string): code is SupportedCurrency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(code);
}
