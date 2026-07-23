import type { NaturalLanguageQuery, CrossDomainInsight } from "../types";

export class ReasoningService {
  private queries = new Map<string, NaturalLanguageQuery>();
  private crossDomainInsights = new Map<string, CrossDomainInsight>();

  addQuery(query: NaturalLanguageQuery): NaturalLanguageQuery {
    this.queries.set(query.id, { ...query, updatedAt: new Date() });
    return query;
  }

  getQuery(id: string): NaturalLanguageQuery | undefined {
    return this.queries.get(id);
  }

  getAllQueries(): NaturalLanguageQuery[] {
    return Array.from(this.queries.values());
  }

  updateQuery(id: string, updates: Partial<NaturalLanguageQuery>): NaturalLanguageQuery | undefined {
    const existing = this.queries.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.queries.set(id, updated);
    return updated;
  }

  deleteQuery(id: string): boolean {
    return this.queries.delete(id);
  }

  addCrossDomainInsight(insight: CrossDomainInsight): CrossDomainInsight {
    this.crossDomainInsights.set(insight.id, { ...insight, updatedAt: new Date() });
    return insight;
  }

  getCrossDomainInsight(id: string): CrossDomainInsight | undefined {
    return this.crossDomainInsights.get(id);
  }

  getAllCrossDomainInsights(): CrossDomainInsight[] {
    return Array.from(this.crossDomainInsights.values());
  }

  getByDomain(domain: string): CrossDomainInsight[] {
    return this.getAllCrossDomainInsights().filter(i => i.domains.includes(domain));
  }

  getCrossDomain(): CrossDomainInsight[] {
    return this.getAllCrossDomainInsights();
  }

  countQueries(): number {
    return this.queries.size;
  }

  countCrossDomainInsights(): number {
    return this.crossDomainInsights.size;
  }
}
