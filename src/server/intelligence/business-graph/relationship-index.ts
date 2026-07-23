import type { GraphRelationship, EntityType, RelationshipType } from "./types";

interface IndexEntry {
  relationship: GraphRelationship;
  indexedAt: number;
}

export class RelationshipIndex {
  private bySource = new Map<string, IndexEntry[]>();
  private byTarget = new Map<string, IndexEntry[]>();
  private byType = new Map<string, IndexEntry[]>();
  private byCompany = new Map<string, IndexEntry[]>();
  private byEntity = new Map<string, IndexEntry[]>();

  private entityKey(entityType: EntityType, entityId: string): string {
    return `${entityType}:${entityId}`;
  }

  private typeKey(type: RelationshipType): string {
    return type;
  }

  private append(map: Map<string, IndexEntry[]>, key: string, entry: IndexEntry): void {
    const existing = map.get(key) ?? [];
    existing.push(entry);
    map.set(key, existing);
  }

  index(relationship: GraphRelationship): void {
    const entry: IndexEntry = { relationship, indexedAt: Date.now() };
    const sourceKey = this.entityKey(relationship.sourceType, relationship.sourceId);
    this.append(this.bySource, sourceKey, entry);
    const targetKey = this.entityKey(relationship.targetType, relationship.targetId);
    this.append(this.byTarget, targetKey, entry);
    this.append(this.byType, this.typeKey(relationship.relationshipType), entry);
    this.append(this.byCompany, relationship.companyId, entry);
    this.append(this.byEntity, sourceKey, entry);
    this.append(this.byEntity, targetKey, entry);
  }

  findBySource(entityType: EntityType, entityId: string): GraphRelationship[] {
    return (this.bySource.get(this.entityKey(entityType, entityId)) ?? []).map((e) => e.relationship);
  }

  findByTarget(entityType: EntityType, entityId: string): GraphRelationship[] {
    return (this.byTarget.get(this.entityKey(entityType, entityId)) ?? []).map((e) => e.relationship);
  }

  findByEntity(entityType: EntityType, entityId: string): GraphRelationship[] {
    return (this.byEntity.get(this.entityKey(entityType, entityId)) ?? []).map((e) => e.relationship);
  }

  findByType(relationshipType: RelationshipType): GraphRelationship[] {
    return (this.byType.get(this.typeKey(relationshipType)) ?? []).map((e) => e.relationship);
  }

  findByCompany(companyId: string): GraphRelationship[] {
    return (this.byCompany.get(companyId) ?? []).map((e) => e.relationship);
  }

  remove(relationshipId: string): void {
    const removeFrom = (map: Map<string, IndexEntry[]>) => {
      for (const [key, entries] of map) {
        const filtered = entries.filter((e) => e.relationship.id !== relationshipId);
        if (filtered.length === 0) map.delete(key);
        else map.set(key, filtered);
      }
    };
    removeFrom(this.bySource);
    removeFrom(this.byTarget);
    removeFrom(this.byType);
    removeFrom(this.byCompany);
    removeFrom(this.byEntity);
  }

  clearCompany(companyId: string): void {
    const relationships = this.findByCompany(companyId);
    for (const rel of relationships) {
      this.remove(rel.id);
    }
  }

  getStats(): { totalRelationships: number; companyCount: number } {
    let totalRelationships = 0;
    const companies = new Set<string>();
    for (const entries of this.byCompany.values()) {
      for (const entry of entries) {
        totalRelationships++;
        companies.add(entry.relationship.companyId);
      }
    }
    return { totalRelationships, companyCount: companies.size };
  }
}

export const relationshipIndex = new RelationshipIndex();
