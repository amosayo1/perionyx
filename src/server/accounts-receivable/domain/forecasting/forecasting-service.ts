import type { ARForecast, ForecastScenario, ForecastPeriod, ARPaymentProjection } from "../../types";
import type { Invoice } from "../../types";

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 86400000);
}

function daysAhead(n: number): Date {
  return new Date(Date.now() + n * 86400000);
}

function rand(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

export class ForecastingService {
  private forecasts = new Map<string, ARForecast>();

  add(forecast: ARForecast): ARForecast {
    this.forecasts.set(forecast.id, forecast);
    return forecast;
  }

  get(id: string): ARForecast | undefined {
    return this.forecasts.get(id);
  }

  getAll(): ARForecast[] {
    return Array.from(this.forecasts.values());
  }

  getByPeriod(period: ForecastPeriod): ARForecast[] {
    return this.getAll().filter((f) => f.period === period);
  }

  getByDateRange(start: Date, end: Date): ARForecast[] {
    return this.getAll().filter((f) => f.forecastDate >= start && f.forecastDate <= end);
  }

  getLatest(): ARForecast | undefined {
    const all = this.getAll();
    if (all.length === 0) return undefined;
    return all.reduce((latest, f) => (f.forecastDate > latest.forecastDate ? f : latest));
  }

  search(query: string): ARForecast[] {
    const q = query.toLowerCase();
    return this.getAll().filter((f) => f.methodology.toLowerCase().includes(q));
  }

  count(): number {
    return this.forecasts.size;
  }

  update(id: string, updates: Partial<ARForecast>): ARForecast {
    const existing = this.forecasts.get(id);
    if (!existing) throw new Error(`Forecast ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.forecasts.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.forecasts.delete(id);
  }

  generateForecast(
    period: ForecastPeriod,
    invoices: Invoice[],
    receipts: { amount: number }[],
    _collections: { amountDue: number }[],
    _historicalData?: { dso: number }[],
  ): ARForecast {
    const totalOutstanding = invoices.reduce((s, i) => s + i.amountDue, 0);
    const totalReceipts = receipts.reduce((s, r) => s + r.amount, 0);
    const totalDue = invoices.filter((i) => i.status === "overdue" || i.status === "partial").reduce((s, i) => s + i.amountDue, 0);
    const collectionRate = totalOutstanding > 0 ? totalReceipts / (totalReceipts + totalOutstanding) : 0.75;
    const projectedCollections = totalOutstanding * (collectionRate + rand(-0.05, 0.05));
    const projectedInvoices = totalOutstanding * (1 + rand(-0.1, 0.15));
    const projectedReceipts = totalReceipts * (1 + rand(-0.08, 0.12));
    const expectedDSO = 45 + rand(-5, 5);
    const expectedCashInflow = totalReceipts + projectedCollections * rand(0.6, 0.8);
    const confidenceLevel = 0.75 + rand(-0.1, 0.1);

    const scenarios: ForecastScenario[] = [
      {
        name: "Optimistic",
        probability: 0.25,
        collections: projectedCollections * 1.2,
        assumptions: ["Early payments accelerate", "No new disputes", "Collection efficiency +20%"],
      },
      {
        name: "Base",
        probability: 0.5,
        collections: projectedCollections,
        assumptions: ["Historical collection patterns continue", "Seasonal variations normal"],
      },
      {
        name: "Pessimistic",
        probability: 0.25,
        collections: projectedCollections * 0.75,
        assumptions: ["Payment delays increase", "New disputes arise", "Economic slowdown"],
      },
    ];

    const forecast: ARForecast = {
      id: `forecast-${Date.now()}`,
      period,
      forecastDate: new Date(),
      projectedCollections: Math.round(projectedCollections * 100) / 100,
      projectedInvoices: Math.round(projectedInvoices * 100) / 100,
      projectedReceipts: Math.round(projectedReceipts * 100) / 100,
      confidenceLow: Math.round(expectedCashInflow * 0.85 * 100) / 100,
      confidenceHigh: Math.round(expectedCashInflow * 1.15 * 100) / 100,
      confidenceLevel: Math.round(confidenceLevel * 100) / 100,
      expectedDSO: Math.round(expectedDSO * 100) / 100,
      expectedCashInflow: Math.round(expectedCashInflow * 100) / 100,
      scenarios,
      methodology: "hybrid",
      accuracy: 0.82 + rand(-0.05, 0.05),
      companyId: invoices[0]?.companyId ?? "company-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.forecasts.set(forecast.id, forecast);
    return forecast;
  }

  generatePaymentProjections(invoices: Invoice[], days: number): ARPaymentProjection[] {
    const projections: ARPaymentProjection[] = [];
    const now = new Date();
    const collectionProbabilities: Record<string, number> = {
      current: 0.95,
      "1to30": 0.8,
      "31to60": 0.6,
      "61to90": 0.4,
      "91plus": 0.2,
    };

    for (let d = 0; d < days; d++) {
      const date = daysAhead(d);
      const dayInvoices = invoices.filter((inv) => {
        if (!inv.dueDate) return false;
        const diffDays = Math.floor((inv.dueDate.getTime() - now.getTime()) / 86400000);
        return diffDays === d;
      });

      const expectedFromInvoices = dayInvoices.reduce((sum, inv) => {
        const bucket = inv.agingBucket || "current";
        const prob = collectionProbabilities[bucket] ?? 0.5;
        return sum + inv.amountDue * prob;
      }, 0);

      const fromRecurring = expectedFromInvoices * 0.1;
      const fromCollections = expectedFromInvoices * 0.05;

      projections.push({
        date,
        expectedAmount: Math.round((expectedFromInvoices + fromRecurring + fromCollections) * 100) / 100,
        confidence: 0.85 - d * 0.005,
        fromInvoices: Math.round(expectedFromInvoices * 100) / 100,
        fromRecurring: Math.round(fromRecurring * 100) / 100,
        fromCollections: Math.round(fromCollections * 100) / 100,
      });
    }

    return projections;
  }

  getForecastAccuracy(): number {
    const all = this.getAll();
    if (all.length === 0) return 0;
    return all.reduce((sum, f) => sum + (f.accuracy ?? 0), 0) / all.length;
  }
}
