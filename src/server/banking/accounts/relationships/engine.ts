import type { AccountRelationship, AccountRelationshipType } from "../types";

export class RelationshipEngine {
  private relationships = new Map<string, AccountRelationship>();

  createRelationship(
    sourceAccountId: string,
    targetAccountId: string,
    type: AccountRelationshipType,
    direction: "source_to_target" | "bidirectional" = "source_to_target",
    config: Record<string, unknown> = {},
  ): AccountRelationship {
    const relationship: AccountRelationship = {
      id: crypto.randomUUID(),
      sourceAccountId,
      targetAccountId,
      type,
      direction,
      config,
      active: true,
      createdAt: new Date().toISOString(),
    };

    this.relationships.set(relationship.id, relationship);
    return relationship;
  }

  getRelationships(accountId: string): AccountRelationship[] {
    return Array.from(this.relationships.values()).filter(
      (r) => r.sourceAccountId === accountId || r.targetAccountId === accountId,
    );
  }

  getRelationshipsByType(type: AccountRelationshipType): AccountRelationship[] {
    return Array.from(this.relationships.values()).filter((r) => r.type === type);
  }

  getSweepRelationships(accountId: string): AccountRelationship[] {
    return this.getRelationships(accountId).filter((r) => r.type === "SWEEP" && r.active);
  }

  getPoolRelationships(accountId: string): AccountRelationship[] {
    return this.getRelationships(accountId).filter((r) => r.type === "CASH_POOL" && r.active);
  }

  getFXSourceForAccount(accountId: string): AccountRelationship | undefined {
    return Array.from(this.relationships.values()).find(
      (r) => r.type === "FX_SOURCE" && r.targetAccountId === accountId && r.active,
    );
  }

  getSettlementAccounts(institutionId: string): AccountRelationship[] {
    return Array.from(this.relationships.values()).filter(
      (r) => r.type === "SETTLEMENT" && r.config.institutionId === institutionId,
    );
  }

  getParentAccount(accountId: string): AccountRelationship | undefined {
    return Array.from(this.relationships.values()).find(
      (r) => r.type === "PARENT" && r.targetAccountId === accountId && r.active,
    );
  }

  getChildAccounts(accountId: string): AccountRelationship[] {
    return Array.from(this.relationships.values()).filter(
      (r) => r.type === "PARENT" && r.sourceAccountId === accountId && r.active,
    );
  }

  deactivateRelationship(id: string): void {
    const rel = this.relationships.get(id);
    if (rel) {
      rel.active = false;
    }
  }

  removeRelationship(id: string): void {
    this.relationships.delete(id);
  }

  clear(): void {
    this.relationships.clear();
  }

  getAllActive(): AccountRelationship[] {
    return Array.from(this.relationships.values()).filter((r) => r.active);
  }

  get count(): number {
    return this.relationships.size;
  }
}

export const relationshipEngine = new RelationshipEngine();