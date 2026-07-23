import type { ExecutiveInsight, InsightCategory, AnomalySeverity, InsightStatus } from "../types";

export class IntelligenceService {
  private insights = new Map<string, ExecutiveInsight>();

  add(insight: ExecutiveInsight): ExecutiveInsight {
    this.insights.set(insight.id, { ...insight, updatedAt: new Date() });
    return insight;
  }

  get(id: string): ExecutiveInsight | undefined {
    return this.insights.get(id);
  }

  getAll(): ExecutiveInsight[] {
    return Array.from(this.insights.values());
  }

  update(id: string, updates: Partial<ExecutiveInsight>): ExecutiveInsight | undefined {
    const existing = this.insights.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.insights.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.insights.delete(id);
  }

  getByCategory(category: InsightCategory): ExecutiveInsight[] {
    return this.getAll().filter(i => i.category === category);
  }

  getBySeverity(severity: AnomalySeverity): ExecutiveInsight[] {
    return this.getAll().filter(i => i.severity === severity);
  }

  getByStatus(status: InsightStatus): ExecutiveInsight[] {
    return this.getAll().filter(i => i.status === status);
  }

  getBySource(sourceDomain: string): ExecutiveInsight[] {
    return this.getAll().filter(i => i.sourceDomain === sourceDomain);
  }

  getByDateRange(start: Date, end: Date): ExecutiveInsight[] {
    return this.getAll().filter(i => i.detectedAt >= start && i.detectedAt <= end);
  }

  search(query: string): ExecutiveInsight[] {
    const lower = query.toLowerCase();
    return this.getAll().filter(i =>
      i.title.toLowerCase().includes(lower) ||
      i.description.toLowerCase().includes(lower) ||
      i.tags.some(t => t.toLowerCase().includes(lower))
    );
  }

  count(): number {
    return this.insights.size;
  }
}
