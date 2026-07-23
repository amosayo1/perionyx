import type { ExecutiveBriefing, BriefingType, ExecutiveRole, BriefingSection, NarrativeTone } from "./types";
import { FREQUENCY_MAP } from "./types";
import { roleAwareBriefingBuilder } from "./role-aware-briefing-builder";

export class BriefingComposer {
  compose(
    companyId: string,
    role: ExecutiveRole,
    type: BriefingType,
    sections: BriefingSection[],
    config: { timezone: string; reportingCurrency: string },
    generationTimeMs: number,
  ): ExecutiveBriefing {
    const filtered = roleAwareBriefingBuilder.filterSectionsForRole(sections, role);

    const period = this.getPeriod(type);
    const periodLabel = this.getPeriodLabel(type);
    const overallNarrative = this.composeOverallNarrative(filtered, role);
    const keyTakeaways = this.extractKeyTakeaways(filtered);
    const dominantTone = this.getDominantTone(filtered);

    return {
      id: `briefing-${companyId}-${role}-${type}-${period.start}-${Date.now()}`,
      type,
      frequency: FREQUENCY_MAP[type],
      companyId,
      role,
      title: this.getTitle(type, role),
      period,
      periodLabel,
      sections: filtered,
      overallNarrative,
      keyTakeaways,
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.getTTL(type)).toISOString(),
      version: 1,
      generationTimeMs,
      auditRef: `briefing-${companyId}-${type}-${Date.now()}`,
    };
  }

  private getTitle(type: BriefingType, role: ExecutiveRole): string {
    const roleLabel = role.charAt(0) + role.slice(1).toLowerCase().replace(/_/g, " ");
    const typeLabels: Record<BriefingType, string> = {
      MORNING_BRIEFING: "Morning Briefing",
      EVENING_SUMMARY: "Evening Summary",
      WEEKLY_EXECUTIVE_REVIEW: "Weekly Executive Review",
      MONTHLY_FINANCIAL_SUMMARY: "Monthly Financial Summary",
      QUARTERLY_BUSINESS_REVIEW: "Quarterly Business Review",
      YEAR_END_EXECUTIVE_SUMMARY: "Year-End Executive Summary",
    };
    return `${roleLabel} — ${typeLabels[type]}`;
  }

  private getPeriod(type: BriefingType): { start: string; end: string } {
    const now = new Date();
    const end = now.toISOString();
    let start: Date;

    switch (type) {
      case "MORNING_BRIEFING":
      case "EVENING_SUMMARY":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "WEEKLY_EXECUTIVE_REVIEW": {
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay() + 1);
        start.setHours(0, 0, 0, 0);
        break;
      }
      case "MONTHLY_FINANCIAL_SUMMARY":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "QUARTERLY_BUSINESS_REVIEW": {
        const qStart = Math.floor(now.getMonth() / 3) * 3;
        start = new Date(now.getFullYear(), qStart, 1);
        break;
      }
      case "YEAR_END_EXECUTIVE_SUMMARY":
        start = new Date(now.getFullYear(), 0, 1);
        break;
    }

    return { start: start.toISOString(), end };
  }

  private getPeriodLabel(type: BriefingType): string {
    const now = new Date();
    switch (type) {
      case "MORNING_BRIEFING": return now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
      case "EVENING_SUMMARY": return `${now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} Evening`;
      case "WEEKLY_EXECUTIVE_REVIEW": return `Week of ${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      case "MONTHLY_FINANCIAL_SUMMARY": return now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      case "QUARTERLY_BUSINESS_REVIEW": {
        const q = Math.floor(now.getMonth() / 3) + 1;
        return `Q${q} ${now.getFullYear()}`;
      }
      case "YEAR_END_EXECUTIVE_SUMMARY": return `FY ${now.getFullYear()}`;
    }
  }

  private composeOverallNarrative(sections: BriefingSection[], role: ExecutiveRole): string {
    const rolePrefix = roleAwareBriefingBuilder.getRoleNarrativePrefix(role);
    const highPriorityNarratives = sections
      .filter((s) => s.tone === "alert")
      .slice(0, 2)
      .map((s) => s.narrative);
    const topNarratives = sections
      .slice(0, 3)
      .map((s) => s.narrative);

    const allNarratives = highPriorityNarratives.length > 0
      ? [...highPriorityNarratives, ...topNarratives]
      : topNarratives;

    return `${rolePrefix}. ${allNarratives.join(" ")}`;
  }

  private extractKeyTakeaways(sections: BriefingSection[]): string[] {
    const takeaways: string[] = [];

    for (const section of sections) {
      if (section.tone === "alert") {
        takeaways.push(section.narrative);
      }
      const negativeMetrics = section.metrics.filter((m) => m.status === "negative" || m.status === "attention");
      for (const metric of negativeMetrics.slice(0, 1)) {
        takeaways.push(`${metric.label}: ${metric.value}`);
      }
    }

    const positiveMetrics = sections.flatMap((s) => s.metrics).filter((m) => m.status === "positive").slice(0, 2);
    for (const metric of positiveMetrics) {
      takeaways.push(`${metric.label} is on track: ${metric.value}`);
    }

    return [...new Set(takeaways)].slice(0, 5);
  }

  private getDominantTone(sections: BriefingSection[]): NarrativeTone {
    const tonePriority: Record<NarrativeTone, number> = { alert: 3, analytical: 2, executive: 1 };
    let dominant: NarrativeTone = "analytical";
    let maxPriority = 0;

    for (const section of sections) {
      const priority = tonePriority[section.tone] ?? 0;
      if (priority > maxPriority) {
        maxPriority = priority;
        dominant = section.tone;
      }
    }

    return dominant;
  }

  private getTTL(type: BriefingType): number {
    switch (type) {
      case "MORNING_BRIEFING": return 12 * 3_600_000;
      case "EVENING_SUMMARY": return 12 * 3_600_000;
      case "WEEKLY_EXECUTIVE_REVIEW": return 3 * 86_400_000;
      case "MONTHLY_FINANCIAL_SUMMARY": return 7 * 86_400_000;
      case "QUARTERLY_BUSINESS_REVIEW": return 14 * 86_400_000;
      case "YEAR_END_EXECUTIVE_SUMMARY": return 30 * 86_400_000;
    }
  }
}

export const briefingComposer = new BriefingComposer();
