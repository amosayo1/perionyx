import type {
  GraphRelationship, BusinessContext, ImpactAnalysis,
  DependencyChain, GraphQuery, GraphQueryResult, EntityType,
} from "./types";
import { relationshipIndex } from "./relationship-index";
import { businessGraphCache } from "./business-graph-cache";
import { relationshipAuditService } from "./relationship-audit-service";
import { entityRelationshipResolver } from "./entity-relationship-resolver";
import { businessContextService } from "./business-context-service";
import { impactAnalyzer } from "./impact-analyzer";
import { dependencyAnalyzer } from "./dependency-analyzer";
import { graphQueryService } from "./graph-query-service";

export class BusinessGraphEngine {
  async getRelationships(
    entityType: EntityType,
    entityId: string,
    companyId: string,
  ): Promise<GraphRelationship[]> {
    const cached = businessGraphCache.getRelationships(companyId);
    if (cached) {
      const filtered = cached.filter(
        (r) =>
          (r.sourceType === entityType && r.sourceId === entityId) ||
          (r.targetType === entityType && r.targetId === entityId),
      );
      if (filtered.length > 0) {
        relationshipAuditService.recordContextAccessed(entityType, entityId, companyId);
        return filtered;
      }
    }

    const resolved = await entityRelationshipResolver.resolveForEntity(entityType, entityId, companyId);
    for (const rel of resolved) {
      relationshipIndex.index(rel);
      relationshipAuditService.recordRelationshipResolved(rel);
    }

    return resolved;
  }

  async getContext(
    entityType: EntityType,
    entityId: string,
    companyId: string,
  ): Promise<BusinessContext> {
    const cached = businessGraphCache.getContext(entityType, entityId, companyId);
    if (cached) return cached;

    await this.ensureRelationshipsLoaded(entityType, entityId, companyId);
    const context = await businessContextService.getContext(entityType, entityId, companyId);

    relationshipAuditService.recordContextAccessed(entityType, entityId, companyId);
    businessGraphCache.setContext(companyId, entityType, entityId, context, 900_000);

    return context;
  }

  async analyzeImpact(
    entityType: EntityType,
    entityId: string,
    companyId: string,
  ): Promise<ImpactAnalysis> {
    const cached = businessGraphCache.getImpact(companyId, entityType, entityId);
    if (cached) return cached;

    await this.ensureRelationshipsLoaded(entityType, entityId, companyId);
    const impact = await impactAnalyzer.analyze(entityType, entityId, companyId);

    relationshipAuditService.recordImpactAnalysis(entityType, entityId, companyId, impact.affectedEntityCount);
    businessGraphCache.setImpact(companyId, entityType, entityId, impact, 300_000);

    return impact;
  }

  async analyzeDependency(
    entityType: EntityType,
    entityId: string,
    companyId: string,
    maxDepth = 10,
  ): Promise<DependencyChain> {
    await this.ensureRelationshipsLoaded(entityType, entityId, companyId);
    return dependencyAnalyzer.analyze(entityType, entityId, companyId, maxDepth);
  }

  async getRelated(
    entityType: EntityType,
    entityId: string,
    relationshipType: string,
    companyId: string,
  ): Promise<GraphRelationship[]> {
    const relationships = await this.getRelationships(entityType, entityId, companyId);
    return relationships.filter((r) => r.relationshipType === relationshipType);
  }

  async query(query: GraphQuery): Promise<GraphQueryResult> {
    relationshipAuditService.recordGraphQuery(
      query.companyId,
      `Query: ${query.sourceType ?? "*"}:${query.sourceId ?? "*"} → ${query.targetType ?? "*"}:${query.targetId ?? "*"} (${query.relationshipType ?? "any"})`,
    );
    return graphQueryService.query(query);
  }

  async refresh(companyId: string): Promise<void> {
    businessGraphCache.invalidate(companyId);
    relationshipIndex.clearCompany(companyId);
  }

  async warmCache(companyId: string): Promise<number> {
    const allRelationships = relationshipIndex.findByCompany(companyId);
    if (allRelationships.length > 0) {
      businessGraphCache.setRelationships(companyId, allRelationships, 3_600_000);
      return allRelationships.length;
    }

    return 0;
  }

  invalidateCache(companyId: string): void {
    businessGraphCache.invalidate(companyId);
  }

  getCacheStats(): { entries: number } {
    return businessGraphCache.getStats();
  }

  getIndexStats(): { totalRelationships: number; companyCount: number } {
    return relationshipIndex.getStats();
  }

  private async ensureRelationshipsLoaded(
    entityType: EntityType,
    entityId: string,
    companyId: string,
  ): Promise<void> {
    const existing = relationshipIndex.findByEntity(entityType, entityId);
    if (existing.length > 0) return;

    const resolved = await entityRelationshipResolver.resolveForEntity(entityType, entityId, companyId);
    for (const rel of resolved) {
      relationshipIndex.index(rel);
      relationshipAuditService.recordRelationshipResolved(rel);
    }
  }
}

export const businessGraphEngine = new BusinessGraphEngine();
