import type { GraphRelationship, ImpactAnalysis, EntityType } from "./types";
import { ENTITY_LABELS } from "./types";
import { relationshipIndex } from "./relationship-index";

export class ImpactAnalyzer {
  async analyze(
    entityType: EntityType,
    entityId: string,
    companyId: string,
  ): Promise<ImpactAnalysis> {
    const directImpacts: GraphRelationship[] = [];
    const indirectImpacts: GraphRelationship[] = [];
    const blockedBy: GraphRelationship[] = [];
    const blocks: GraphRelationship[] = [];

    const relationships = relationshipIndex.findByEntity(entityType, entityId);

    for (const rel of relationships) {
      const isSource = rel.sourceType === entityType && rel.sourceId === entityId;
      const isTarget = rel.targetType === entityType && rel.targetId === entityId;

      if (rel.relationshipType === "BLOCKS") {
        if (isSource) blocks.push(rel);
        if (isTarget) blockedBy.push(rel);
      } else if (rel.relationshipType === "DEPENDS_ON") {
        if (isSource) blockedBy.push(rel);
        if (isTarget) blocks.push(rel);
      } else {
        if (isSource) directImpacts.push(rel);
        if (isTarget) indirectImpacts.push(rel);
      }
    }

    const allAffected = new Set<string>();
    for (const rel of [...directImpacts, ...indirectImpacts, ...blocks]) {
      const isSource = rel.sourceType === entityType && rel.sourceId === entityId;
      allAffected.add(isSource ? `${rel.targetType}:${rel.targetId}` : `${rel.sourceType}:${rel.sourceId}`);
    }

    const riskLevel = this.calculateRiskLevel(directImpacts, blockedBy, blocks);

    return {
      entityType,
      entityId,
      directImpacts,
      indirectImpacts,
      blockedBy,
      blocks,
      riskLevel,
      affectedEntityCount: allAffected.size,
      analyzedAt: new Date().toISOString(),
    };
  }

  private calculateRiskLevel(
    directImpacts: GraphRelationship[],
    blockedBy: GraphRelationship[],
    blocks: GraphRelationship[],
  ): "low" | "moderate" | "high" | "critical" {
    const totalDirect = directImpacts.length + blocks.length;
    const blockedCount = blockedBy.length;

    if (blockedCount > 5 || totalDirect > 20) return "critical";
    if (blockedCount > 2 || totalDirect > 10) return "high";
    if (totalDirect > 5 || blockedCount > 0) return "moderate";
    return "low";
  }
}

export const impactAnalyzer = new ImpactAnalyzer();
