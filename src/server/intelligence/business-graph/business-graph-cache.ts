import type { GraphRelationship, BusinessContext, ImpactAnalysis, DependencyChain, GraphQueryResult } from "./types";

interface CacheEntry<T> {
  data: T;
  storedAt: number;
  ttlMs: number;
}

export class BusinessGraphCache {
  private relationships = new Map<string, CacheEntry<GraphRelationship[]>>();
  private contexts = new Map<string, CacheEntry<BusinessContext>>();
  private impacts = new Map<string, CacheEntry<ImpactAnalysis>>();
  private dependencies = new Map<string, CacheEntry<DependencyChain>>();
  private queryResults = new Map<string, CacheEntry<GraphQueryResult>>();

  private key(companyId: string, suffix: string): string {
    return `${companyId}:${suffix}`;
  }

  getRelationships(companyId: string): GraphRelationship[] | null {
    const entry = this.relationships.get(this.key(companyId, "all"));
    if (!entry) return null;
    if (Date.now() - entry.storedAt > entry.ttlMs) {
      this.relationships.delete(this.key(companyId, "all"));
      return null;
    }
    return entry.data;
  }

  setRelationships(companyId: string, relationships: GraphRelationship[], ttlMs: number): void {
    this.relationships.set(this.key(companyId, "all"), { data: relationships, storedAt: Date.now(), ttlMs });
  }

  getContext(entityType: string, entityId: string, companyId: string): BusinessContext | null {
    const k = this.key(companyId, `context:${entityType}:${entityId}`);
    const entry = this.contexts.get(k);
    if (!entry) return null;
    if (Date.now() - entry.storedAt > entry.ttlMs) {
      this.contexts.delete(k);
      return null;
    }
    return entry.data;
  }

  setContext(companyId: string, entityType: string, entityId: string, context: BusinessContext, ttlMs: number): void {
    const k = this.key(companyId, `context:${entityType}:${entityId}`);
    this.contexts.set(k, { data: context, storedAt: Date.now(), ttlMs });
  }

  getImpact(companyId: string, entityType: string, entityId: string): ImpactAnalysis | null {
    const k = this.key(companyId, `impact:${entityType}:${entityId}`);
    const entry = this.impacts.get(k);
    if (!entry) return null;
    if (Date.now() - entry.storedAt > entry.ttlMs) {
      this.impacts.delete(k);
      return null;
    }
    return entry.data;
  }

  setImpact(companyId: string, entityType: string, entityId: string, impact: ImpactAnalysis, ttlMs: number): void {
    const k = this.key(companyId, `impact:${entityType}:${entityId}`);
    this.impacts.set(k, { data: impact, storedAt: Date.now(), ttlMs });
  }

  invalidate(companyId: string): void {
    for (const [k] of this.relationships) { if (k.startsWith(companyId)) this.relationships.delete(k); }
    for (const [k] of this.contexts) { if (k.startsWith(companyId)) this.contexts.delete(k); }
    for (const [k] of this.impacts) { if (k.startsWith(companyId)) this.impacts.delete(k); }
    for (const [k] of this.dependencies) { if (k.startsWith(companyId)) this.dependencies.delete(k); }
    for (const [k] of this.queryResults) { if (k.startsWith(companyId)) this.queryResults.delete(k); }
  }

  clear(): void {
    this.relationships.clear();
    this.contexts.clear();
    this.impacts.clear();
    this.dependencies.clear();
    this.queryResults.clear();
  }

  getStats(): { entries: number } {
    return {
      entries: this.relationships.size + this.contexts.size + this.impacts.size + this.dependencies.size + this.queryResults.size,
    };
  }
}

export const businessGraphCache = new BusinessGraphCache();
