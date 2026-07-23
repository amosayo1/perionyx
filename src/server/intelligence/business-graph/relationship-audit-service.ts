import type { GraphRelationship, EntityType } from "./types";

interface GraphAuditEvent {
  action: string;
  entityType?: EntityType;
  entityId?: string;
  companyId: string;
  relationshipId?: string;
  details: string;
  timestamp: string;
}

export class RelationshipAuditService {
  private events: GraphAuditEvent[] = [];
  private readonly maxEvents = 10_000;

  recordRelationshipResolved(relationship: GraphRelationship): void {
    this.events.push({
      action: "RELATIONSHIP_RESOLVED",
      entityType: relationship.sourceType,
      entityId: relationship.sourceId,
      companyId: relationship.companyId,
      relationshipId: relationship.id,
      details: `${relationship.sourceType}:${relationship.sourceId} → ${relationship.relationshipType} → ${relationship.targetType}:${relationship.targetId}`,
      timestamp: new Date().toISOString(),
    });
    this.trim();
  }

  recordContextAccessed(entityType: EntityType, entityId: string, companyId: string): void {
    this.events.push({
      action: "CONTEXT_ACCESSED",
      entityType,
      entityId,
      companyId,
      details: `Business context accessed for ${entityType}:${entityId}`,
      timestamp: new Date().toISOString(),
    });
    this.trim();
  }

  recordImpactAnalysis(entityType: EntityType, entityId: string, companyId: string, affectedCount: number): void {
    this.events.push({
      action: "IMPACT_ANALYSIS",
      entityType,
      entityId,
      companyId,
      details: `Impact analysis for ${entityType}:${entityId} — ${affectedCount} affected entities`,
      timestamp: new Date().toISOString(),
    });
    this.trim();
  }

  recordGraphQuery(companyId: string, queryDescription: string): void {
    this.events.push({
      action: "GRAPH_QUERY",
      companyId,
      details: queryDescription,
      timestamp: new Date().toISOString(),
    });
    this.trim();
  }

  getEvents(companyId: string, limit = 50): GraphAuditEvent[] {
    return this.events
      .filter((e) => e.companyId === companyId)
      .slice(-limit)
      .reverse();
  }

  getAllEvents(limit = 100): GraphAuditEvent[] {
    return this.events.slice(-limit).reverse();
  }

  private trim(): void {
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }
}

export const relationshipAuditService = new RelationshipAuditService();
