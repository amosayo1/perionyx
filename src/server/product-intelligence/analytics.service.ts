import { ProductIntelligenceRepository } from "./repository";
import type {
  Contribution, FeatureRequest, Evidence, Person, AdvisoryProfile,
  WorkflowPainPoint, Recommendation, RoadmapItem, Confidence,
} from "./types";

export interface AnalyticsSummary {
  totalPersons: number;
  totalConversations: number;
  totalContributions: number;
  totalEvidence: number;
  totalFeatureRequests: number;
  totalProblems: number;
  totalRecommendations: number;
  totalRoadmapItems: number;
  totalOrganizations: number;
  totalValidations: number;
}

export class ProductAnalyticsService {
  constructor(private repo: ProductIntelligenceRepository) {}

  getSummary(): AnalyticsSummary {
    return {
      totalPersons: this.repo.getAllPersons().length,
      totalConversations: this.repo.getAllConversations().length,
      totalContributions: this.repo.getAllContributions().length,
      totalEvidence: this.repo.getAllEvidence().length,
      totalFeatureRequests: this.repo.getAllFeatureRequests().length,
      totalProblems: this.repo.getAllProblems().length,
      totalRecommendations: this.repo.getAllRecommendations().length,
      totalRoadmapItems: this.repo.getAllRoadmapItems().length,
      totalOrganizations: this.repo.getAllOrganizations().length,
      totalValidations: [...this.repo.getStore().validations.values()].length,
    };
  }

  getMostRequestedFeatures(limit = 20): Array<{ title: string; count: number; priority: string; status: string }> {
    return this.repo.getAllFeatureRequests()
      .sort((a, b) => {
        const priority = { critical: 4, high: 3, medium: 2, low: 1 };
        return (priority[b.priority] ?? 0) - (priority[a.priority] ?? 0);
      })
      .slice(0, limit)
      .map((fr) => ({
        title: fr.title,
        count: fr.requestedByPersonIds.length,
        priority: fr.priority,
        status: fr.implementationStatus,
      }));
  }

  getMostCommonProblems(limit = 20): Array<{ problem: string; domain: string; severity: string; evidenceCount: number }> {
    return this.repo.getAllProblems()
      .sort((a, b) => {
        const sv = { critical: 4, high: 3, medium: 2, low: 1 };
        return (sv[b.severity] ?? 0) - (sv[a.severity] ?? 0);
      })
      .slice(0, limit)
      .map((p) => ({
        problem: p.title,
        domain: p.domain,
        severity: p.severity,
        evidenceCount: p.evidenceIds.length,
      }));
  }

  getMostCommonSpreadsheetDependencies(): Array<{ problem: string; count: number }> {
    const results = this.repo.getAllEvidence().filter((e) =>
      e.currentWorkaround.toLowerCase().includes("spreadsheet") ||
      e.currentWorkaround.toLowerCase().includes("excel") ||
      e.currentWorkaround.toLowerCase().includes("manual"),
    );
    const grouped = new Map<string, number>();
    for (const e of results) {
      grouped.set(e.problem, (grouped.get(e.problem) ?? 0) + 1);
    }
    return [...grouped.entries()]
      .map(([problem, count]) => ({ problem, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  getMostRequestedAutomation(): Array<{ area: string; count: number }> {
    const contributions = this.repo.getAllContributions().filter(
      (c) =>
        c.problem.toLowerCase().includes("automat") ||
        c.suggestedSolution?.toLowerCase().includes("automat"),
    );
    const grouped = new Map<string, number>();
    for (const c of contributions) {
      const key = c.domain;
      grouped.set(key, (grouped.get(key) ?? 0) + 1);
    }
    return [...grouped.entries()]
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count);
  }

  getMostRequestedAI(): Array<{ area: string; count: number }> {
    const contributions = this.repo.getAllContributions().filter(
      (c) =>
        c.problem.toLowerCase().includes("ai") ||
        c.problem.toLowerCase().includes("intelligent") ||
        c.problem.toLowerCase().includes("forecast") ||
        c.suggestedSolution?.toLowerCase().includes("ai") ||
        c.suggestedSolution?.toLowerCase().includes("machine learning") ||
        c.suggestedSolution?.toLowerCase().includes("intelligent"),
    );
    const grouped = new Map<string, number>();
    for (const c of contributions) {
      const key = c.domain;
      grouped.set(key, (grouped.get(key) ?? 0) + 1);
    }
    return [...grouped.entries()]
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count);
  }

  getMostRequestedDashboards(): Array<{ dashboard: string; count: number }> {
    const contributions = this.repo.getAllContributions().filter(
      (c) =>
        c.problem.toLowerCase().includes("dashboard") ||
        c.problem.toLowerCase().includes("report") ||
        c.suggestedSolution?.toLowerCase().includes("dashboard") ||
        c.suggestedSolution?.toLowerCase().includes("kpi"),
    );
    const grouped = new Map<string, number>();
    for (const c of contributions) {
      const key = c.domain;
      grouped.set(key, (grouped.get(key) ?? 0) + 1);
    }
    return [...grouped.entries()]
      .map(([dashboard, count]) => ({ dashboard, count }))
      .sort((a, b) => b.count - a.count);
  }

  getTopErpFrustrations(): Array<{ erp: string; count: number }> {
    const persons = this.repo.getAllPersons();
    const erpCounts = new Map<string, number>();
    for (const p of persons) {
      for (const erp of p.erpExperience) {
        erpCounts.set(erp, (erpCounts.get(erp) ?? 0) + 1);
      }
    }
    // Count evidence mentioning each ERP
    const evidence = this.repo.getAllEvidence();
    for (const e of evidence) {
      for (const erp of e.supportingErpSystems) {
        erpCounts.set(erp, (erpCounts.get(erp) ?? 0) + 1);
      }
    }
    return [...erpCounts.entries()]
      .map(([erp, count]) => ({ erp, count }))
      .sort((a, b) => b.count - a.count);
  }

  getTopComplianceProblems(): Array<{ problem: string; count: number }> {
    const evidence = this.repo.getAllEvidence().filter(
      (e) =>
        e.problem.toLowerCase().includes("tax") ||
        e.problem.toLowerCase().includes("vat") ||
        e.problem.toLowerCase().includes("zatca") ||
        e.problem.toLowerCase().includes("compliance") ||
        e.problem.toLowerCase().includes("regulatory"),
    );
    const grouped = new Map<string, number>();
    for (const e of evidence) {
      grouped.set(e.problem, (grouped.get(e.problem) ?? 0) + 1);
    }
    return [...grouped.entries()]
      .map(([problem, count]) => ({ problem, count }))
      .sort((a, b) => b.count - a.count);
  }

  getTopTreasuryProblems(): Array<{ problem: string; count: number }> {
    const evidence = this.repo.getAllEvidence().filter((e) =>
      e.problem.toLowerCase().includes("treasury") ||
      e.problem.toLowerCase().includes("cash") ||
      e.problem.toLowerCase().includes("liquidity") ||
      e.problem.toLowerCase().includes("fx") ||
      e.problem.toLowerCase().includes("forecast"),
    );
    const grouped = new Map<string, number>();
    for (const e of evidence) {
      grouped.set(e.problem, (grouped.get(e.problem) ?? 0) + 1);
    }
    return [...grouped.entries()]
      .map(([problem, count]) => ({ problem, count }))
      .sort((a, b) => b.count - a.count);
  }

  getTopReportingProblems(): Array<{ problem: string; count: number }> {
    const evidence = this.repo.getAllEvidence().filter((e) =>
      e.problem.toLowerCase().includes("report") ||
      e.problem.toLowerCase().includes("dashboard") ||
      e.problem.toLowerCase().includes("kpi"),
    );
    const grouped = new Map<string, number>();
    for (const e of evidence) {
      grouped.set(e.problem, (grouped.get(e.problem) ?? 0) + 1);
    }
    return [...grouped.entries()]
      .map(([problem, count]) => ({ problem, count }))
      .sort((a, b) => b.count - a.count);
  }

  getTopReconciliationProblems(): Array<{ problem: string; count: number }> {
    const evidence = this.repo.getAllEvidence().filter((e) =>
      e.problem.toLowerCase().includes("reconcil"),
    );
    const grouped = new Map<string, number>();
    for (const e of evidence) {
      grouped.set(e.problem, (grouped.get(e.problem) ?? 0) + 1);
    }
    return [...grouped.entries()]
      .map(([problem, count]) => ({ problem, count }))
      .sort((a, b) => b.count - a.count);
  }

  getTopMonthEndCloseProblems(): Array<{ problem: string; count: number }> {
    const evidence = this.repo.getAllEvidence().filter((e) =>
      e.problem.toLowerCase().includes("month-end") ||
      e.problem.toLowerCase().includes("month end") ||
      e.problem.toLowerCase().includes("close"),
    );
    const grouped = new Map<string, number>();
    for (const e of evidence) {
      grouped.set(e.problem, (grouped.get(e.problem) ?? 0) + 1);
    }
    return [...grouped.entries()]
      .map(([problem, count]) => ({ problem, count }))
      .sort((a, b) => b.count - a.count);
  }

  getEvidenceHeatMap(): Array<{ domain: string; count: number; severityScore: number }> {
    const evidence = this.repo.getAllEvidence();
    const severityValues = { critical: 4, high: 3, medium: 2, low: 1 };
    const grouped = new Map<string, { count: number; totalSeverity: number }>();
    for (const e of evidence) {
      const existing = grouped.get(e.problem) ?? { count: 0, totalSeverity: 0 };
      existing.count++;
      existing.totalSeverity += severityValues[e.severity];
      grouped.set(e.problem, existing);
    }
    return [...grouped.entries()]
      .map(([domain, data]) => ({
        domain,
        count: data.count,
        severityScore: Math.round(data.totalSeverity / data.count * 25),
      }))
      .sort((a, b) => b.severityScore - a.severityScore)
      .slice(0, 30);
  }

  getContributionLeaderboard(limit = 20): Array<{ name: string; contributions: number; role: string; score: number }> {
    const persons = this.repo.getAllPersons();
    const allContributions = this.repo.getAllContributions();
    return persons
      .map((p) => ({
        name: p.name,
        role: p.role,
        contributions: allContributions.filter((c) => c.personId === p.id).length,
        score: 0,
      }))
      .map((entry) => ({
        ...entry,
        score: entry.contributions,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  getPersonAnalytics(personId: string): {
    person: Person | undefined;
    conversationCount: number;
    contributionCount: number;
    evidenceCount: number;
    featureRequests: number;
    advisoryProfile: AdvisoryProfile | undefined;
  } {
    const person = this.repo.getPerson(personId);
    return {
      person,
      conversationCount: this.repo.getPersonConversations(personId).length,
      contributionCount: this.repo.getPersonContributions(personId).length,
      evidenceCount: this.repo.getAllEvidence().filter((e) => e.supportingPersonIds.includes(personId)).length,
      featureRequests: this.repo.getAllFeatureRequests().filter((fr) => fr.requestedByPersonIds.includes(personId)).length,
      advisoryProfile: this.repo.getAdvisoryProfile(personId),
    };
  }

  getModuleAnalytics(moduleId: string): {
    contributions: number;
    evidence: number;
    featureRequests: number;
    recommendations: number;
    painPoints: number;
  } {
    return {
      contributions: this.repo.getAllContributions().filter((c) => c.moduleIds.includes(moduleId)).length,
      evidence: this.repo.getAllEvidence().filter((e) => e.moduleIds.includes(moduleId)).length,
      featureRequests: this.repo.getAllFeatureRequests().filter((fr) => fr.moduleIds.includes(moduleId)).length,
      recommendations: this.repo.getAllRecommendations().filter((r) => r.moduleIds.includes(moduleId)).length,
      painPoints: this.repo.getAllWorkflowPainPoints().filter((wp) => wp.evidenceIds.some((eid) => {
        const ev = this.repo.getEvidence(eid);
        return ev?.moduleIds.includes(moduleId);
      })).length,
    };
  }
}
