import type { UserBehaviorProfile } from "./types";
import { userBehaviorAnalyzer } from "./user-behavior-analyzer";

export interface BehaviorInsight {
  type: "rising_module" | "declining_module" | "frequent_time" | "approval_speed" | "search_focus";
  label: string;
  score: number;
  detail: string;
}

export class BehaviorLearningService {
  analyze(userId: string, companyId: string): BehaviorInsight[] {
    const profile = userBehaviorAnalyzer.getProfile(userId, companyId);
    const insights: BehaviorInsight[] = [];

    const modules = profile.frequentModules.sort((a, b) => b.visits - a.visits);
    if (modules.length > 0) {
      const topModule = modules[0];
      insights.push({
        type: "rising_module",
        label: `Primary focus: ${topModule.module}`,
        score: Math.min(topModule.visits / 10, 1),
        detail: `${topModule.module} used ${topModule.visits} times`,
      });
    }

    if (profile.approvalPatterns.length > 0) {
      const totalApprovals = profile.approvalPatterns.reduce((s, a) => s + a.count, 0);
      const avgResponse = profile.approvalPatterns.reduce((s, a) => s + a.avgResponseTimeMs, 0) / profile.approvalPatterns.length;
      insights.push({
        type: "approval_speed",
        label: `Average approval response: ${Math.round(avgResponse / 60000)} min`,
        score: avgResponse < 60000 ? 0.9 : avgResponse < 300000 ? 0.6 : 0.3,
        detail: `${totalApprovals} approvals processed`,
      });
    }

    if (profile.searchPatterns.length > 0) {
      const topSearch = profile.searchPatterns.sort((a, b) => b.count - a.count)[0];
      insights.push({
        type: "search_focus",
        label: `Frequent search: "${topSearch.query}"`,
        score: Math.min(topSearch.count / 5, 1),
        detail: `Searched ${topSearch.count} times`,
      });
    }

    return insights;
  }

  getLearningSummary(userId: string, companyId: string): string {
    const insights = this.analyze(userId, companyId);
    if (insights.length === 0) return "Not enough data to learn patterns yet.";

    return insights.map((i) => `• ${i.label} (${i.detail})`).join("\n");
  }
}

export const behaviorLearningService = new BehaviorLearningService();
