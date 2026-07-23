import type { GraphQuery, GraphQueryResult, GraphRelationship } from "./types";
import { relationshipIndex } from "./relationship-index";

export class GraphQueryService {
  async query(query: GraphQuery): Promise<GraphQueryResult> {
    let results: GraphRelationship[] = [];

    if (query.sourceType && query.sourceId) {
      results = relationshipIndex.findBySource(query.sourceType, query.sourceId);
    } else if (query.targetType && query.targetId) {
      results = relationshipIndex.findByTarget(query.targetType, query.targetId);
    } else if (query.sourceType && !query.sourceId) {
      results = relationshipIndex.findByType(query.relationshipType ?? "RELATED_TO")
        .filter((r) => r.sourceType === query.sourceType);
    } else if (query.targetType && !query.targetId) {
      results = relationshipIndex.findByType(query.relationshipType ?? "RELATED_TO")
        .filter((r) => r.targetType === query.targetType);
    } else {
      results = relationshipIndex.findByCompany(query.companyId);
    }

    if (query.relationshipType) {
      results = results.filter((r) => r.relationshipType === query.relationshipType);
    }

    if (query.sourceType && !query.sourceId) {
      results = results.filter((r) => r.sourceType === query.sourceType);
    }
    if (query.targetType && !query.targetId) {
      results = results.filter((r) => r.targetType === query.targetType);
    }

    results = results.filter((r) => r.companyId === query.companyId);

    const totalCount = results.length;
    if (query.limit && query.limit > 0) {
      results = results.slice(0, query.limit);
    }

    return {
      relationships: results,
      totalCount,
      query,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const graphQueryService = new GraphQueryService();
