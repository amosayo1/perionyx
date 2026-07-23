import type { SuggestedAction, SuggestedActionPriority, Citation, UserContext } from "./types";

export class RecommendationComposer {
  composeFromCitations(citations: Citation[], user: UserContext): SuggestedAction[] {
    const actions: SuggestedAction[] = [];
    const seen = new Set<string>();

    for (const c of citations) {
      const action = this.inferAction(c, user);
      if (action && !seen.has(action.action)) {
        actions.push(action);
        seen.add(action.action);
      }
    }

    return actions.slice(0, 5);
  }

  composeDefaultActions(user: UserContext): SuggestedAction[] {
    const actions: SuggestedAction[] = [];

    actions.push({
      id: `action-view-insights-${Date.now()}`,
      label: "View executive insights",
      action: "navigate",
      url: "/analytics",
      priority: "medium",
    });

    actions.push({
      id: `action-search-${Date.now()}`,
      label: "Search across all modules",
      action: "navigate",
      url: "/search",
      priority: "low",
    });

    return actions;
  }

  private inferAction(citation: Citation, _user: UserContext): SuggestedAction | null {
    const lower = citation.snippet.toLowerCase();

    if (lower.includes("approval") && (lower.includes("pending") || lower.includes("awaiting"))) {
      return {
        id: `action-approve-${citation.id}`,
        label: "Review pending approval",
        action: "review",
        entityType: citation.entityType,
        entityId: citation.entityId,
        url: citation.entityId ? `/approvals/${citation.entityId}` : "/approvals",
        priority: "high",
      };
    }

    if (lower.includes("violation") || lower.includes("compliance") || lower.includes("policy")) {
      return {
        id: `action-review-violation-${citation.id}`,
        label: "Review compliance item",
        action: "navigate",
        entityType: citation.entityType,
        entityId: citation.entityId,
        url: citation.entityId ? `/compliance/${citation.entityId}` : "/compliance",
        priority: "high",
      };
    }

    if (lower.includes("risk") || lower.includes("alert")) {
      return {
        id: `action-risk-${citation.id}`,
        label: "Investigate risk alert",
        action: "investigate",
        entityType: citation.entityType,
        entityId: citation.entityId,
        url: citation.entityId ? `/risk/${citation.entityId}` : "/risk",
        priority: "high",
      };
    }

    if (lower.includes("payment") && (lower.includes("fail") || lower.includes("reject"))) {
      return {
        id: `action-payment-${citation.id}`,
        label: "Review failed payment",
        action: "review",
        entityType: citation.entityType,
        entityId: citation.entityId,
        url: citation.entityId ? `/transactions/${citation.entityId}` : "/transactions",
        priority: "high",
      };
    }

    if (lower.includes("workflow") && (lower.includes("fail") || lower.includes("delay") || lower.includes("bottleneck"))) {
      return {
        id: `action-workflow-${citation.id}`,
        label: "Review workflow status",
        action: "navigate",
        url: "/workflows",
        priority: "medium",
      };
    }

    if (lower.includes("report") || lower.includes("briefing")) {
      return {
        id: `action-report-${citation.id}`,
        label: "View full report",
        action: "navigate",
        url: "/reports",
        priority: "medium",
      };
    }

    if (lower.includes("reconciliation") || lower.includes("month-end") || lower.includes("close")) {
      return {
        id: `action-recon-${citation.id}`,
        label: "Review month-end progress",
        action: "navigate",
        url: "/reconciliation",
        priority: "high",
      };
    }

    return null;
  }
}

export const recommendationComposer = new RecommendationComposer();
