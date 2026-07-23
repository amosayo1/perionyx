import type { BusinessContext, EntityType, GraphRelationship } from "./types";
import { ENTITY_LABELS } from "./types";
import { relationshipIndex } from "./relationship-index";

export class BusinessContextService {
  async getContext(
    entityType: EntityType,
    entityId: string,
    companyId: string,
  ): Promise<BusinessContext> {
    const relationships = relationshipIndex.findByEntity(entityType, entityId);

    const categorize = (type: string): GraphRelationship[] =>
      relationships.filter(
        (r) =>
          (r.sourceType === type || r.targetType === type) &&
          (r.companyId === companyId),
      );

    return {
      entityType,
      entityId,
      label: ENTITY_LABELS[entityType] ?? entityType,
      relatedWorkflows: categorize("WORKFLOW"),
      relatedApprovals: categorize("APPROVAL"),
      relatedRisks: categorize("RISK"),
      relatedPolicies: categorize("POLICY"),
      relatedReports: categorize("REPORT"),
      relatedDashboards: categorize("DASHBOARD"),
      relatedUsers: categorize("USER"),
      relatedNotifications: categorize("NOTIFICATION"),
      relatedAnalytics: categorize("WORKFLOW_INSTANCE"),
      relatedAccounts: categorize("TREASURY_ACCOUNT"),
      relatedCompliance: categorize("COMPLIANCE_ITEM"),
      contextGeneratedAt: new Date().toISOString(),
    };
  }
}

export const businessContextService = new BusinessContextService();
