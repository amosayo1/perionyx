import { logger } from "@/lib/logger";
import type { FxProvider, FxRate } from "./fx.types";

const SUPPORTED_CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "CAD", "CHF", "AUD", "MXN", "BRL", "NGN", "AED", "ZAR",
];

export class ExchangeRateHostProvider implements FxProvider {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getRates(baseCurrency: string): Promise<FxRate[]> {
    const url = `https://api.exchangerate.host/latest?base=${baseCurrency}&access_key=${this.apiKey}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `ExchangeRate.host API error (${res.status}): ${body ? body.slice(0, 200) : res.statusText}`,
      );
    }

    const data = (await res.json()) as {
      success: boolean;
      base: string;
      date?: string;
      rates: Record<string, number>;
    };

    if (!data.success) {
      throw new Error("ExchangeRate.host API returned success=false for " + baseCurrency);
    }

    const rates: FxRate[] = [];
    for (const quote of SUPPORTED_CURRENCIES) {
      if (quote === baseCurrency) continue;
      const rate = data.rates[quote];
      if (typeof rate === "number" && rate > 0 && isFinite(rate)) {
        rates.push({ baseCurrency, quoteCurrency: quote, rate });
      }
    }

    if (rates.length === 0) {
      throw new Error("ExchangeRate.host returned no valid rates for " + baseCurrency);
    }

    return rates;
  }
}

export class MockFxProvider implements FxProvider {
  async getRates(baseCurrency: string): Promise<FxRate[]> {
    const mockData: Record<string, Record<string, number>> = {
      USD: { EUR: 0.92, GBP: 0.79, JPY: 149.5, CAD: 1.36, CHF: 0.88, AUD: 1.53, MXN: 17.2, BRL: 4.98, NGN: 1540, AED: 3.67, ZAR: 18.5 },
      EUR: { USD: 1.09, GBP: 0.86, JPY: 162.5, CAD: 1.48, CHF: 0.96, AUD: 1.66, NGN: 1674, AED: 4.0, ZAR: 20.1 },
      GBP: { USD: 1.27, EUR: 1.16, JPY: 189.2, NGN: 1956, AED: 4.67, ZAR: 23.5 },
    };

    const quotes = mockData[baseCurrency];
    if (!quotes) return [];

    return Object.entries(quotes).map(([quoteCurrency, rate]) => ({
      baseCurrency,
      quoteCurrency,
      rate,
    }));
  }
}

export function createFxProvider(): FxProvider {
  const apiKey = process.env.FX_API_KEY;
  if (apiKey && apiKey.length > 0) {
    return new ExchangeRateHostProvider(apiKey);
  }
  logger.warn("[FX] No FX_API_KEY found — using mock provider. Set FX_API_KEY for live rates.");
  return new MockFxProvider();
}
