import type { RelationshipRuleDefinition, EntityType, RelationshipType } from "./types";

export class BusinessRelationshipRegistry {
  private rules = new Map<string, RelationshipRuleDefinition>();

  private key(sourceType: EntityType, targetType: EntityType, relationshipType: RelationshipType): string {
    return `${sourceType}:${targetType}:${relationshipType}`;
  }

  register(rule: RelationshipRuleDefinition): void {
    const k = this.key(rule.sourceType, rule.targetType, rule.relationshipType);
    this.rules.set(k, rule);
  }

  getRule(sourceType: EntityType, targetType: EntityType, relationshipType: RelationshipType): RelationshipRuleDefinition | undefined {
    return this.rules.get(this.key(sourceType, targetType, relationshipType));
  }

  getRulesForSource(sourceType: EntityType): RelationshipRuleDefinition[] {
    return Array.from(this.rules.values()).filter((r) => r.sourceType === sourceType);
  }

  getRulesForTarget(targetType: EntityType): RelationshipRuleDefinition[] {
    return Array.from(this.rules.values()).filter((r) => r.targetType === targetType);
  }

  getAllRules(): RelationshipRuleDefinition[] {
    return Array.from(this.rules.values());
  }

  getRelationshipTypes(): RelationshipType[] {
    const types = new Set<RelationshipType>();
    for (const rule of this.rules.values()) {
      types.add(rule.relationshipType);
      types.add(rule.inverseType);
    }
    return Array.from(types);
  }

  getEntityTypes(): EntityType[] {
    const types = new Set<EntityType>();
    for (const rule of this.rules.values()) {
      types.add(rule.sourceType);
      types.add(rule.targetType);
    }
    return Array.from(types);
  }

  getCount(): number {
    return this.rules.size;
  }

  registerDefaults(): void {
    const defaults: RelationshipRuleDefinition[] = [
      { sourceType: "PAYMENT", targetType: "APPROVAL", relationshipType: "TRIGGERS", inverseType: "GENERATED_BY", description: "A payment may trigger one or more approvals", resolverPriority: 1 },
      { sourceType: "APPROVAL", targetType: "PAYMENT", relationshipType: "APPROVES", inverseType: "REFERENCES", description: "An approval approves a payment", resolverPriority: 1 },
      { sourceType: "PAYMENT", targetType: "USER", relationshipType: "OWNED_BY", inverseType: "CREATES", description: "A payment is created by a user", resolverPriority: 2 },
      { sourceType: "WORKFLOW_INSTANCE", targetType: "PAYMENT", relationshipType: "REFERENCES", inverseType: "GENERATED_BY", description: "A workflow instance may reference a payment", resolverPriority: 2 },
      { sourceType: "WORKFLOW", targetType: "WORKFLOW_INSTANCE", relationshipType: "GENERATED_BY", inverseType: "REFERENCES", description: "A workflow definition generates instances", resolverPriority: 1 },
      { sourceType: "POLICY", targetType: "PAYMENT", relationshipType: "COMPLIES_WITH", inverseType: "VIOLATES", description: "A policy governs payments", resolverPriority: 3 },
      { sourceType: "PAYMENT", targetType: "POLICY", relationshipType: "VIOLATES", inverseType: "COMPLIES_WITH", description: "A payment may violate a policy", resolverPriority: 2 },
      { sourceType: "RISK", targetType: "PAYMENT", relationshipType: "RELATED_TO", inverseType: "RELATED_TO", description: "A risk may be related to a payment", resolverPriority: 3 },
      { sourceType: "COMPLIANCE_ITEM", targetType: "POLICY", relationshipType: "REFERENCES", inverseType: "GENERATED_BY", description: "A compliance item relates to a policy", resolverPriority: 2 },
      { sourceType: "USER", targetType: "ROLE", relationshipType: "INHERITED_FROM", inverseType: "OWNED_BY", description: "A user has a role", resolverPriority: 1 },
      { sourceType: "APPROVAL", targetType: "USER", relationshipType: "ESCALATES_TO", inverseType: "OWNED_BY", description: "An approval may escalate to a user", resolverPriority: 2 },
      { sourceType: "AUDIT_EVENT", targetType: "PAYMENT", relationshipType: "REFERENCES", inverseType: "GENERATED_BY", description: "An audit event tracks a payment", resolverPriority: 2 },
      { sourceType: "AUDIT_EVENT", targetType: "USER", relationshipType: "REFERENCES", inverseType: "GENERATED_BY", description: "An audit event tracks a user action", resolverPriority: 2 },
      { sourceType: "AUDIT_EVENT", targetType: "WORKFLOW_INSTANCE", relationshipType: "REFERENCES", inverseType: "GENERATED_BY", description: "An audit event tracks a workflow", resolverPriority: 2 },
      { sourceType: "AUDIT_EVENT", targetType: "APPROVAL", relationshipType: "REFERENCES", inverseType: "GENERATED_BY", description: "An audit event tracks an approval", resolverPriority: 2 },
      { sourceType: "NOTIFICATION", targetType: "PAYMENT", relationshipType: "RELATED_TO", inverseType: "GENERATED_BY", description: "A notification relates to a payment", resolverPriority: 3 },
      { sourceType: "NOTIFICATION", targetType: "APPROVAL", relationshipType: "RELATED_TO", inverseType: "GENERATED_BY", description: "A notification relates to an approval", resolverPriority: 3 },
      { sourceType: "REPORT", targetType: "PAYMENT", relationshipType: "REFERENCES", inverseType: "GENERATED_BY", description: "A report references payment data", resolverPriority: 3 },
      { sourceType: "REPORT", targetType: "WORKFLOW", relationshipType: "REFERENCES", inverseType: "GENERATED_BY", description: "A report references workflow data", resolverPriority: 3 },
      { sourceType: "DASHBOARD", targetType: "REPORT", relationshipType: "REFERENCES", inverseType: "GENERATED_BY", description: "A dashboard contains reports", resolverPriority: 2 },
      { sourceType: "TREASURY_ACCOUNT", targetType: "PAYMENT", relationshipType: "REFERENCES", inverseType: "RELATED_TO", description: "A treasury account is referenced by payments", resolverPriority: 2 },
      { sourceType: "PAYMENT", targetType: "TREASURY_ACCOUNT", relationshipType: "RELATED_TO", inverseType: "REFERENCES", description: "A payment affects a treasury account", resolverPriority: 1 },
      { sourceType: "INVOICE", targetType: "PAYMENT", relationshipType: "TRIGGERS", inverseType: "GENERATED_BY", description: "An invoice triggers a payment", resolverPriority: 2 },
      { sourceType: "VENDOR", targetType: "PAYMENT", relationshipType: "REFERENCES", inverseType: "RELATED_TO", description: "A vendor receives payments", resolverPriority: 2 },
      { sourceType: "CUSTOMER", targetType: "PAYMENT", relationshipType: "REFERENCES", inverseType: "RELATED_TO", description: "A customer sends payments", resolverPriority: 2 },
      { sourceType: "AUTOMATION", targetType: "WORKFLOW", relationshipType: "TRIGGERS", inverseType: "GENERATED_BY", description: "An automation triggers a workflow", resolverPriority: 1 },
      { sourceType: "RULE", targetType: "WORKFLOW", relationshipType: "COMPLIES_WITH", inverseType: "REFERENCES", description: "A business rule governs a workflow", resolverPriority: 2 },
      { sourceType: "RISK", targetType: "COMPLIANCE_ITEM", relationshipType: "RELATED_TO", inverseType: "RELATED_TO", description: "A risk relates to a compliance item", resolverPriority: 3 },
      { sourceType: "WORKFLOW_INSTANCE", targetType: "WORKFLOW", relationshipType: "REFERENCES", inverseType: "GENERATED_BY", description: "A workflow instance references its definition", resolverPriority: 1 },
      { sourceType: "POLICY", targetType: "RULE", relationshipType: "REFERENCES", inverseType: "GENERATED_BY", description: "A policy references business rules", resolverPriority: 2 },
      { sourceType: "APPROVAL", targetType: "POLICY", relationshipType: "COMPLIES_WITH", inverseType: "REFERENCES", description: "An approval is governed by policies", resolverPriority: 3 },
      { sourceType: "WORKFLOW", targetType: "RISK", relationshipType: "RELATED_TO", inverseType: "RELATED_TO", description: "A workflow may be related to risks", resolverPriority: 3 },
      { sourceType: "TREASURY_ACCOUNT", targetType: "BANK", relationshipType: "REFERENCES", inverseType: "OWNED_BY", description: "A treasury account is at a bank", resolverPriority: 2 },
      { sourceType: "WORKFLOW_INSTANCE", targetType: "USER", relationshipType: "OWNED_BY", inverseType: "CREATES", description: "A workflow instance is owned by a user", resolverPriority: 2 },
    ];

    for (const rule of defaults) {
      this.register(rule);
    }
  }
}

export const businessRelationshipRegistry = new BusinessRelationshipRegistry();
