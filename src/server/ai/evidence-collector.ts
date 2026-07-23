import type { Citation, CitationSource, UserContext, PageContext } from "./types";
import type { ExecutiveRole, BriefingType } from "@/server/intelligence/briefings/types";
import { executiveIntelligenceEngine } from "@/server/intelligence";
import { executiveBriefingEngine } from "@/server/intelligence/briefings";
import { predictionEngine } from "@/server/intelligence/predictions";
import { businessGraphEngine } from "@/server/intelligence/business-graph";
import { enterpriseSearchEngine } from "@/server/search";

export class EvidenceCollector {
  async collect(
    message: string,
    user: UserContext,
    page: PageContext,
  ): Promise<{ citations: Citation[]; modulesUsed: Set<string> }> {
    const citations: Citation[] = [];
    const modulesUsed = new Set<string>();

    const insights = await this.collectInsights(user, page);
    citations.push(...insights.citations);
    for (const m of insights.modulesUsed) modulesUsed.add(m);

    const predictions = await this.collectPredictions(user);
    citations.push(...predictions.citations);
    for (const m of predictions.modulesUsed) modulesUsed.add(m);

    if (page.selectedEntityType && page.selectedEntityId) {
      const graph = await this.collectGraphRelationships(user, page);
      citations.push(...graph.citations);
      for (const m of graph.modulesUsed) modulesUsed.add(m);
    }

    const searchResults = await this.collectSearchEvidence(message, user);
    citations.push(...searchResults.citations);
    for (const m of searchResults.modulesUsed) modulesUsed.add(m);

    const briefings = await this.collectBriefings(user);
    citations.push(...briefings.citations);
    for (const m of briefings.modulesUsed) modulesUsed.add(m);

    return { citations, modulesUsed };
  }

  private async collectInsights(
    user: UserContext,
    _page: PageContext,
  ): Promise<{ citations: Citation[]; modulesUsed: string[] }> {
    try {
      const insights = await executiveIntelligenceEngine.getInsights(user.companyId, {
        minPriority: "high",
      });

      const moduleLabel = "Executive Intelligence";
      const source: CitationSource = "module";

      return {
        citations: insights.slice(0, 5).map((i) => ({
          id: `insight-${i.id}`,
          source,
          module: moduleLabel,
          snippet: `${i.title}: ${i.description}`,
          relevance: i.severity === "critical" ? 1.0 : i.severity === "high" ? 0.8 : 0.6,
        })),
        modulesUsed: [moduleLabel],
      };
    } catch {
      return { citations: [], modulesUsed: [] };
    }
  }

  private async collectPredictions(
    user: UserContext,
  ): Promise<{ citations: Citation[]; modulesUsed: string[] }> {
    try {
      const allPredictions = await predictionEngine.getPredictions(user.companyId);
      const filtered = allPredictions.filter(
        (p) => p.confidence === "HIGH" || p.confidence === "VERY_HIGH",
      );

      const moduleLabel = "Predictive Intelligence";
      const source: CitationSource = "prediction";

      return {
        citations: filtered.slice(0, 5).map((p) => ({
          id: `prediction-${p.id}`,
          source,
          module: moduleLabel,
          snippet: `${p.title} (confidence: ${p.confidence})${p.businessImpact ? ` — ${p.businessImpact}` : ""}`,
          relevance: p.confidence === "VERY_HIGH" ? 0.95 : p.confidence === "HIGH" ? 0.8 : 0.5,
        })),
        modulesUsed: [moduleLabel],
      };
    } catch {
      return { citations: [], modulesUsed: [] };
    }
  }

  private async collectGraphRelationships(
    user: UserContext,
    page: PageContext,
  ): Promise<{ citations: Citation[]; modulesUsed: string[] }> {
    if (!page.selectedEntityType || !page.selectedEntityId) {
      return { citations: [], modulesUsed: [] };
    }

    try {
      const relationships = await businessGraphEngine.getRelationships(
        page.selectedEntityType as never,
        page.selectedEntityId,
        user.companyId,
      );
      const moduleLabel = "Business Graph";
      const source: CitationSource = "business_graph";

      return {
        citations: relationships.slice(0, 8).map((r) => ({
          id: `graph-${r.id}`,
          source,
          module: moduleLabel,
          snippet: `${r.sourceType}:${r.sourceId.slice(0, 8)} → ${r.relationshipType} → ${r.targetType}:${r.targetId.slice(0, 8)}`,
          relevance: 0.7,
        })),
        modulesUsed: [moduleLabel],
      };
    } catch {
      return { citations: [], modulesUsed: [] };
    }
  }

  private async collectSearchEvidence(
    message: string,
    user: UserContext,
  ): Promise<{ citations: Citation[]; modulesUsed: string[] }> {
    try {
      const results = await enterpriseSearchEngine.search(
        {
          query: message,
          mode: "GLOBAL",
          companyId: user.companyId,
          userId: user.userId,
          limit: 5,
          offset: 0,
        },
        user.permissions,
      );

      const source: CitationSource = "search";

      return {
        citations: results.map((r) => ({
          id: `search-${r.document.id}`,
          source,
          module: r.document.sourceType,
          entityType: r.document.entityType,
          entityId: r.document.entityId,
          snippet: r.document.title + (r.document.description ? ` — ${r.document.description}` : ""),
          relevance: r.score,
        })),
        modulesUsed: ["Enterprise Search"],
      };
    } catch {
      return { citations: [], modulesUsed: [] };
    }
  }

  private async collectBriefings(
    user: UserContext,
  ): Promise<{ citations: Citation[]; modulesUsed: string[] }> {
    try {
      const role = this.resolveExecutiveRole(user.roles);
      const briefingType: BriefingType = "MORNING_BRIEFING";

      const briefing = await executiveBriefingEngine.getBriefing(
        user.companyId,
        role,
        briefingType,
      );

      if (!briefing) return { citations: [], modulesUsed: [] };

      const source: CitationSource = "module";

      return {
        citations: [
          {
            id: `briefing-${briefing.id}`,
            source,
            module: "Executive Briefings",
            snippet: briefing.overallNarrative ?? "Daily briefing available",
            relevance: 0.8,
          },
        ],
        modulesUsed: ["Executive Briefings"],
      };
    } catch {
      return { citations: [], modulesUsed: [] };
    }
  }

  private resolveExecutiveRole(roles: string[]): ExecutiveRole {
    const priority: Record<string, ExecutiveRole> = {
      CFO: "CFO",
      TREASURER: "TREASURER",
      CONTROLLER: "CONTROLLER",
      FINANCE_MANAGER: "FINANCE_MANAGER",
      AUDITOR: "AUDITOR",
      OPERATIONS: "OPERATIONS",
      ADMINISTRATOR: "ADMINISTRATOR",
    };
    for (const role of roles) {
      const upper = role.toUpperCase().replace(/\s+/g, "_");
      if (priority[upper]) return priority[upper];
    }
    return "FINANCE_MANAGER";
  }
}

export const evidenceCollector = new EvidenceCollector();
