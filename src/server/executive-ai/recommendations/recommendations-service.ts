import type { AIRecommendation, InsightCategory } from "../types";

export class RecommendationService {
  private recommendations = new Map<string, AIRecommendation>();

  add(rec: AIRecommendation): AIRecommendation {
    this.recommendations.set(rec.id, { ...rec, updatedAt: new Date() });
    return rec;
  }

  get(id: string): AIRecommendation | undefined {
    return this.recommendations.get(id);
  }

  getAll(): AIRecommendation[] {
    return Array.from(this.recommendations.values());
  }

  update(id: string, updates: Partial<AIRecommendation>): AIRecommendation | undefined {
    const existing = this.recommendations.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.recommendations.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.recommendations.delete(id);
  }

  getByCategory(category: InsightCategory): AIRecommendation[] {
    return this.getAll().filter(r => r.category === category);
  }

  getByStatus(status: "pending" | "implemented" | "dismissed"): AIRecommendation[] {
    return this.getAll().filter(r => r.status === status);
  }

  getByDomain(sourceDomain: string): AIRecommendation[] {
    return this.getAll().filter(r => r.sourceDomain === sourceDomain);
  }

  getPending(): AIRecommendation[] {
    return this.getByStatus("pending");
  }

  getImplemented(): AIRecommendation[] {
    return this.getByStatus("implemented");
  }

  search(query: string): AIRecommendation[] {
    const lower = query.toLowerCase();
    return this.getAll().filter(r =>
      r.title.toLowerCase().includes(lower) ||
      r.description.toLowerCase().includes(lower)
    );
  }

  count(): number {
    return this.recommendations.size;
  }
}
