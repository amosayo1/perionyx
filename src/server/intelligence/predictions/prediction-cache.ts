import type { Prediction, ForecastSummary, BusinessInsight, PredictionCategory } from "./types";

interface CacheEntry<T> {
  data: T;
  storedAt: number;
  ttlMs: number;
}

export class PredictionCache {
  private predictions = new Map<string, CacheEntry<Prediction[]>>();
  private insights = new Map<string, CacheEntry<BusinessInsight[]>>();
  private summaries = new Map<string, CacheEntry<ForecastSummary>>();

  private key(companyId: string, suffix?: string): string {
    return suffix ? `${companyId}:${suffix}` : companyId;
  }

  getPredictions(companyId: string, category?: PredictionCategory): Prediction[] | null {
    const k = this.key(companyId, category);
    const entry = this.predictions.get(k);
    if (!entry) return null;
    if (Date.now() - entry.storedAt > entry.ttlMs) {
      this.predictions.delete(k);
      return null;
    }
    return entry.data;
  }

  setPredictions(companyId: string, predictions: Prediction[], ttlMs: number, category?: PredictionCategory): void {
    const k = this.key(companyId, category);
    this.predictions.set(k, { data: predictions, storedAt: Date.now(), ttlMs });
  }

  getInsights(companyId: string): BusinessInsight[] | null {
    const entry = this.insights.get(this.key(companyId));
    if (!entry) return null;
    if (Date.now() - entry.storedAt > entry.ttlMs) {
      this.insights.delete(this.key(companyId));
      return null;
    }
    return entry.data;
  }

  setInsights(companyId: string, insights: BusinessInsight[], ttlMs: number): void {
    this.insights.set(this.key(companyId), { data: insights, storedAt: Date.now(), ttlMs });
  }

  getSummary(companyId: string): ForecastSummary | null {
    const entry = this.summaries.get(this.key(companyId));
    if (!entry) return null;
    if (Date.now() - entry.storedAt > entry.ttlMs) {
      this.summaries.delete(this.key(companyId));
      return null;
    }
    return entry.data;
  }

  setSummary(companyId: string, summary: ForecastSummary, ttlMs: number): void {
    this.summaries.set(this.key(companyId), { data: summary, storedAt: Date.now(), ttlMs });
  }

  invalidate(companyId: string): void {
    for (const [k] of this.predictions) {
      if (k.startsWith(companyId)) this.predictions.delete(k);
    }
    this.insights.delete(this.key(companyId));
    this.summaries.delete(this.key(companyId));
  }

  clear(): void {
    this.predictions.clear();
    this.insights.clear();
    this.summaries.clear();
  }
}

export const predictionCache = new PredictionCache();
