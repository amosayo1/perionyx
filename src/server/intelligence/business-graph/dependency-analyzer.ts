import type { GraphRelationship, GraphNode, DependencyChain, EntityType } from "./types";
import { ENTITY_LABELS } from "./types";
import { relationshipIndex } from "./relationship-index";

export class DependencyAnalyzer {
  async analyze(
    entityType: EntityType,
    entityId: string,
    companyId: string,
    maxDepth = 10,
  ): Promise<DependencyChain> {
    const visited = new Set<string>();
    const chain: { node: GraphNode; relationship: GraphRelationship; depth: number }[] = [];
    let cycleDetected = false;

    const root: GraphNode = {
      entityType,
      entityId,
      label: ENTITY_LABELS[entityType] ?? entityType,
      metadata: {},
    };

    const queue: { entityType: EntityType; entityId: string; depth: number; incomingRel?: GraphRelationship }[] = [
      { entityType, entityId, depth: 0 },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = `${current.entityType}:${current.entityId}`;

      if (visited.has(key)) {
        if (current.depth > 0) cycleDetected = true;
        continue;
      }
      visited.add(key);

      if (current.depth > 0 && current.incomingRel) {
        chain.push({
          node: {
            entityType: current.entityType,
            entityId: current.entityId,
            label: ENTITY_LABELS[current.entityType] ?? current.entityType,
            metadata: {},
          },
          relationship: current.incomingRel,
          depth: current.depth,
        });
      }

      if (current.depth >= maxDepth) continue;

      const relationships = relationshipIndex.findByEntity(current.entityType, current.entityId);

      for (const rel of relationships) {
        const isSource = rel.sourceType === current.entityType && rel.sourceId === current.entityId;
        const nextEntityType = isSource ? rel.targetType : rel.sourceType;
        const nextEntityId = isSource ? rel.targetId : rel.sourceId;
        const nextKey = `${nextEntityType}:${nextEntityId}`;

        if (!visited.has(nextKey)) {
          queue.push({
            entityType: nextEntityType as EntityType,
            entityId: nextEntityId,
            depth: current.depth + 1,
            incomingRel: rel,
          });
        } else {
          cycleDetected = true;
        }
      }
    }

    return {
      root,
      chain,
      cycleDetected,
      maxDepth,
    };
  }
}

export const dependencyAnalyzer = new DependencyAnalyzer();
