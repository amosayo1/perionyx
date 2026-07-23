import type { ExecutiveBriefing, BriefingType, ExecutiveRole } from "./types";
import { BRIEFING_TYPES } from "./types";
import { executiveBriefingEngine } from "./executive-briefing-engine";

interface ExecutiveDigest {
  companyId: string;
  role: ExecutiveRole;
  briefings: ExecutiveBriefing[];
  combinedTakeaways: string[];
  generatedAt: string;
}

export class ExecutiveDigestService {
  async getDigest(companyId: string, role: ExecutiveRole): Promise<ExecutiveDigest> {
    const types: BriefingType[] = ["MORNING_BRIEFING", "WEEKLY_EXECUTIVE_REVIEW", "MONTHLY_FINANCIAL_SUMMARY"];

    const results = await Promise.allSettled(
      types.map((type) => executiveBriefingEngine.getBriefing(companyId, role, type)),
    );

    const briefings: ExecutiveBriefing[] = [];
    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        briefings.push(result.value);
      }
    }

    const combinedTakeaways = this.combineTakeaways(briefings);

    return {
      companyId,
      role,
      briefings,
      combinedTakeaways,
      generatedAt: new Date().toISOString(),
    };
  }

  async getMorningBriefing(companyId: string, role: ExecutiveRole): Promise<ExecutiveBriefing | null> {
    return executiveBriefingEngine.getBriefing(companyId, role, "MORNING_BRIEFING");
  }

  async getEveningSummary(companyId: string, role: ExecutiveRole): Promise<ExecutiveBriefing | null> {
    return executiveBriefingEngine.getBriefing(companyId, role, "EVENING_SUMMARY");
  }

  async getWeeklyReview(companyId: string, role: ExecutiveRole): Promise<ExecutiveBriefing | null> {
    return executiveBriefingEngine.getBriefing(companyId, role, "WEEKLY_EXECUTIVE_REVIEW");
  }

  async getMonthlySummary(companyId: string, role: ExecutiveRole): Promise<ExecutiveBriefing | null> {
    return executiveBriefingEngine.getBriefing(companyId, role, "MONTHLY_FINANCIAL_SUMMARY");
  }

  async refreshAll(companyId: string, role: ExecutiveRole): Promise<void> {
    for (const bt of BRIEFING_TYPES) {
      await executiveBriefingEngine.refresh(companyId, role, bt.type);
    }
  }

  invalidateCompanyCache(companyId: string): void {
    executiveBriefingEngine.invalidateCache(companyId);
  }

  private combineTakeaways(briefings: ExecutiveBriefing[]): string[] {
    const seen = new Set<string>();
    const takeaways: string[] = [];

    for (const briefing of briefings) {
      for (const takeaway of briefing.keyTakeaways) {
        const key = takeaway.toLowerCase().trim();
        if (!seen.has(key)) {
          seen.add(key);
          takeaways.push(takeaway);
        }
      }
    }

    return takeaways.slice(0, 5);
  }
}

export const executiveDigestService = new ExecutiveDigestService();
