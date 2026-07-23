import type { IntelligenceCategory, Insight, InsightPriority, SignalSource } from "./types";

interface InsightDefinition {
  type: string;
  category: IntelligenceCategory;
  source: SignalSource;
  defaultPriority: InsightPriority;
  description: string;
  ttl: number;
}

export class InsightRegistry {
  private definitions = new Map<string, InsightDefinition>();
  private activeInsights = new Map<string, Insight>();

  register(type: string, def: InsightDefinition): void {
    this.definitions.set(type, def);
  }

  getDefinition(type: string): InsightDefinition | undefined {
    return this.definitions.get(type);
  }

  getAllDefinitions(): InsightDefinition[] {
    return Array.from(this.definitions.values());
  }

  getDefinitionsByCategory(category: IntelligenceCategory): InsightDefinition[] {
    return this.getAllDefinitions().filter((d) => d.category === category);
  }

  getDefinitionsBySource(source: SignalSource): InsightDefinition[] {
    return this.getAllDefinitions().filter((d) => d.source === source);
  }

  registerInsight(insight: Insight): void {
    this.activeInsights.set(insight.id, insight);
  }

  getInsight(id: string): Insight | undefined {
    return this.activeInsights.get(id);
  }

  getActiveInsights(companyId?: string): Insight[] {
    const insights = Array.from(this.activeInsights.values());
    if (companyId) return insights.filter((i) => i.companyId === companyId);
    return insights;
  }

  getInsightsByPriority(priority: InsightPriority, companyId?: string): Insight[] {
    return this.getActiveInsights(companyId).filter((i) => i.severity === priority);
  }

  getInsightsByCategory(category: IntelligenceCategory, companyId?: string): Insight[] {
    return this.getActiveInsights(companyId).filter((i) => i.category === category);
  }

  updateInsightStatus(id: string, status: Insight["status"]): void {
    const insight = this.activeInsights.get(id);
    if (insight) {
      insight.status = status;
      this.activeInsights.set(id, insight);
    }
  }

  removeExpired(): number {
    const now = Date.now();
    let removed = 0;
    for (const [id, insight] of this.activeInsights) {
      if (new Date(insight.expiresAt).getTime() < now) {
        this.activeInsights.delete(id);
        removed++;
      }
    }
    return removed;
  }

  clearCompanyInsights(companyId: string): number {
    let removed = 0;
    for (const [id, insight] of this.activeInsights) {
      if (insight.companyId === companyId) {
        this.activeInsights.delete(id);
        removed++;
      }
    }
    return removed;
  }

  getInsightCount(): number {
    return this.activeInsights.size;
  }
}

export const insightRegistry = new InsightRegistry();
