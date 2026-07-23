import type { ExchangeRateReference, CurrencyBalance } from "../../types";

export class RevaluationService {
  private rates = new Map<string, ExchangeRateReference>();
  private revaluationEntries: CurrencyBalance[] = [];

  addRate(rate: ExchangeRateReference): ExchangeRateReference {
    this.rates.set(rate.id, rate);
    return rate;
  }

  getRate(id: string): ExchangeRateReference | undefined {
    return this.rates.get(id);
  }

  getAllRates(): ExchangeRateReference[] {
    return Array.from(this.rates.values());
  }

  getRateByCurrencyPair(from: string, to: string, date: Date): ExchangeRateReference | undefined {
    return this.getAllRates().find(r =>
      r.fromCurrency === from && r.toCurrency === to && r.date <= date
    );
  }

  getRatesByDate(date: Date): ExchangeRateReference[] {
    return this.getAllRates().filter(r => r.date >= date);
  }

  revalueAccount(balance: CurrencyBalance): CurrencyBalance {
    this.revaluationEntries.push(balance);
    return balance;
  }

  getRevaluationEntries(): CurrencyBalance[] {
    return this.revaluationEntries;
  }

  getRevaluationEntriesByPeriod(periodId: string): CurrencyBalance[] {
    return this.revaluationEntries.filter(e => e.periodId === periodId);
  }

  count(): number {
    return this.rates.size;
  }

  countRevaluations(): number {
    return this.revaluationEntries.length;
  }
}
