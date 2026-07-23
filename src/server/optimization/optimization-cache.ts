import type { OptimizationRecommendation, OptimizationSummary, OptimizationPriority, OptimizationCategory, RecommendationLifecycle } from "./types";

export class OptimizationCache {
  private recommendations = new Map<string, OptimizationRecommendation[]>();
  private summaries = new Map<string, OptimizationSummary>();
  private readonly ttlMs = 300_000;
  private readonly storedAt = new Map<string, number>();

  private key(companyId: string, type: string): string {
    return `${companyId}:${type}`;
  }

  private isValid(key: string): boolean {
    const stored = this.storedAt.get(key);
    if (!stored) return false;
    return Date.now() - stored < this.ttlMs;
  }

  getRecommendations(companyId: string): OptimizationRecommendation[] | null {
    const key = this.key(companyId, "recs");
    if (!this.isValid(key)) {
      this.recommendations.delete(key);
      return null;
    }
    return this.recommendations.get(key) ?? null;
  }

  setRecommendations(companyId: string, recs: OptimizationRecommendation[]): void {
    const key = this.key(companyId, "recs");
    this.recommendations.set(key, recs);
    this.storedAt.set(key, Date.now());
  }

  getSummary(companyId: string): OptimizationSummary | null {
    const key = this.key(companyId, "summary");
    if (!this.isValid(key)) {
      this.summaries.delete(key);
      return null;
    }
    return this.summaries.get(key) ?? null;
  }

  setSummary(companyId: string, summary: OptimizationSummary): void {
    const key = this.key(companyId, "summary");
    this.summaries.set(key, summary);
    this.storedAt.set(key, Date.now());
  }

  invalidate(companyId: string): void {
    this.recommendations.delete(this.key(companyId, "recs"));
    this.summaries.delete(this.key(companyId, "summary"));
    this.storedAt.delete(this.key(companyId, "recs"));
    this.storedAt.delete(this.key(companyId, "summary"));
  }

  invalidateAll(): void {
    this.recommendations.clear();
    this.summaries.clear();
    this.storedAt.clear();
  }
}

export const optimizationCache = new OptimizationCache();
