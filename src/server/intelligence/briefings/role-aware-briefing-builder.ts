import type { ExecutiveRole, BriefingSection, BriefingSectionType, BriefingMetric, BriefingRecommendation } from "./types";
import { ROLE_SECTION_PRIORITY } from "./types";

export class RoleAwareBriefingBuilder {
  filterSectionsForRole(sections: BriefingSection[], role: ExecutiveRole): BriefingSection[] {
    const priorityOrder = ROLE_SECTION_PRIORITY[role];
    if (!priorityOrder) return sections;

    const sectionMap = new Map<BriefingSectionType, BriefingSection>();
    for (const section of sections) {
      sectionMap.set(section.type, section);
    }

    const ordered: BriefingSection[] = [];
    const used = new Set<BriefingSectionType>();

    for (const sectionType of priorityOrder) {
      const section = sectionMap.get(sectionType);
      if (section) {
        ordered.push(section);
        used.add(sectionType);
      }
    }

    return ordered;
  }

  getRoleNarrativePrefix(role: ExecutiveRole): string {
    const prefixes: Record<ExecutiveRole, string> = {
      CFO: "Financial overview for executive decision-making",
      TREASURER: "Treasury and liquidity position summary",
      CONTROLLER: "Control environment and compliance status",
      FINANCE_MANAGER: "Operational finance and team workflow status",
      AUDITOR: "Audit-relevant activity and compliance posture",
      ADMINISTRATOR: "Full system-wide operational summary",
      OPERATIONS: "Operational workflow and system health summary",
    };
    return prefixes[role] ?? "Executive briefing";
  }

  getRoleSpecificMetrics(metrics: BriefingMetric[], role: ExecutiveRole): BriefingMetric[] {
    switch (role) {
      case "CFO":
        return metrics.filter((m) =>
          m.label.toLowerCase().includes("health") ||
          m.label.toLowerCase().includes("cash") ||
          m.label.toLowerCase().includes("risk") ||
          m.label.toLowerCase().includes("trend")
        );
      case "TREASURER":
        return metrics.filter((m) =>
          m.label.toLowerCase().includes("cash") ||
          m.label.toLowerCase().includes("balance") ||
          m.label.toLowerCase().includes("pending") ||
          m.label.toLowerCase().includes("liquid") ||
          m.label.toLowerCase().includes("transfer")
        );
      case "CONTROLLER":
        return metrics.filter((m) =>
          m.label.toLowerCase().includes("compliance") ||
          m.label.toLowerCase().includes("violation") ||
          m.label.toLowerCase().includes("risk") ||
          m.label.toLowerCase().includes("alert") ||
          m.label.toLowerCase().includes("approval")
        );
      case "FINANCE_MANAGER":
        return metrics.filter((m) =>
          m.label.toLowerCase().includes("approval") ||
          m.label.toLowerCase().includes("workflow") ||
          m.label.toLowerCase().includes("pending") ||
          m.label.toLowerCase().includes("queue")
        );
      case "AUDITOR":
        return metrics.filter((m) =>
          m.label.toLowerCase().includes("compliance") ||
          m.label.toLowerCase().includes("violation") ||
          m.label.toLowerCase().includes("alert") ||
          m.label.toLowerCase().includes("risk")
        );
      case "ADMINISTRATOR":
        return metrics;
      case "OPERATIONS":
        return metrics.filter((m) =>
          m.label.toLowerCase().includes("connector") ||
          m.label.toLowerCase().includes("workflow") ||
          m.label.toLowerCase().includes("queue") ||
          m.label.toLowerCase().includes("failed") ||
          m.label.toLowerCase().includes("sync")
        );
    }
  }

  getRoleSpecificRecommendations(recommendations: BriefingRecommendation[], role: ExecutiveRole): BriefingRecommendation[] {
    switch (role) {
      case "CFO":
        return recommendations.filter((r) =>
          r.relatedModule === "treasury" || r.relatedModule === "risk" || r.relatedModule === "compliance"
        );
      case "TREASURER":
        return recommendations.filter((r) =>
          r.relatedModule === "treasury" || r.relatedModule === "payments" || r.relatedModule === "connectors"
        );
      case "CONTROLLER":
        return recommendations.filter((r) =>
          r.relatedModule === "compliance" || r.relatedModule === "risk" || r.relatedModule === "approvals"
        );
      case "FINANCE_MANAGER":
        return recommendations;
      case "AUDITOR":
        return recommendations.filter((r) =>
          r.relatedModule === "compliance" || r.relatedModule === "risk" || r.relatedModule === "audit"
        );
      case "ADMINISTRATOR":
        return recommendations;
      case "OPERATIONS":
        return recommendations.filter((r) =>
          r.relatedModule === "connectors" || r.relatedModule === "workflow_engine" || r.relatedModule === "automation_studio"
        );
    }
  }
}

export const roleAwareBriefingBuilder = new RoleAwareBriefingBuilder();
