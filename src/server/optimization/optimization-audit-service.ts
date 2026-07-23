import type { OptimizationRecommendation } from "./types";

export class OptimizationAuditService {
  private entries: AuditEntry[] = [];
  private readonly maxEntries = 50_000;

  recordCreated(recommendation: OptimizationRecommendation, userId: string): void {
    this.add("recommendation_created", recommendation.id, userId, recommendation.companyId, {
      title: recommendation.title,
      category: recommendation.category,
      priority: recommendation.priority,
      confidenceScore: recommendation.confidenceScore,
    });
  }

  recordLifecycleChange(id: string, userId: string, companyId: string, from: string, to: string): void {
    this.add("lifecycle_changed", id, userId, companyId, { from, to });
  }

  recordReviewed(id: string, userId: string, companyId: string): void {
    this.add("recommendation_reviewed", id, userId, companyId, {});
  }

  recordAccepted(id: string, userId: string, companyId: string): void {
    this.add("recommendation_accepted", id, userId, companyId, {});
  }

  recordRejected(id: string, userId: string, companyId: string, reason?: string): void {
    this.add("recommendation_rejected", id, userId, companyId, { reason });
  }

  recordImplemented(id: string, userId: string, companyId: string): void {
    this.add("recommendation_implemented", id, userId, companyId, {});
  }

  recordMeasured(id: string, userId: string, companyId: string, result: string): void {
    this.add("recommendation_measured", id, userId, companyId, { result });
  }

  recordAnalysisRun(companyId: string): void {
    this.add("analysis_run", "batch", "system", companyId, {});
  }

  getByCompany(companyId: string, limit = 100): AuditEntry[] {
    return this.entries
      .filter((e) => e.companyId === companyId)
      .slice(-limit)
      .reverse();
  }

  private add(action: string, recommendationId: string, userId: string, companyId: string, details: Record<string, unknown>): void {
    this.entries.push({ action, recommendationId, userId, companyId, details, timestamp: new Date().toISOString() });
    this.trim();
  }

  private trim(): void {
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
  }
}

interface AuditEntry {
  action: string;
  recommendationId: string;
  userId: string;
  companyId: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export const optimizationAuditService = new OptimizationAuditService();
