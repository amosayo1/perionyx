import type { ExecutiveBriefing, BriefingType, ExecutiveRole, BriefingConfig } from "./types";
import { DEFAULT_BRIEFING_CONFIG, BRIEFING_TYPES } from "./types";
import { briefingCache } from "./briefing-cache";
import { briefingSectionGenerator } from "./briefing-section-generator";
import { briefingComposer } from "./briefing-composer";
import { briefingScheduler } from "./briefing-scheduler";

export class ExecutiveBriefingEngine {
  private configs = new Map<string, BriefingConfig>();
  private generationLocks = new Map<string, Promise<ExecutiveBriefing>>();

  constructor() {
    briefingScheduler.onGeneration(async (companyId, role, type) => {
      await this.generate(companyId, role, type);
    });
  }

  async getBriefing(
    companyId: string,
    role: ExecutiveRole,
    type: BriefingType,
  ): Promise<ExecutiveBriefing | null> {
    const config = this.getConfig(companyId);
    const period = this.getPeriodKey(type);
    const cached = briefingCache.get(companyId, role, type, period);
    if (cached) return cached;

    return this.generate(companyId, role, type);
  }

  async generate(
    companyId: string,
    role: ExecutiveRole,
    type: BriefingType,
  ): Promise<ExecutiveBriefing> {
    const lockKey = `${companyId}:${role}:${type}`;
    const existing = this.generationLocks.get(lockKey);
    if (existing) return existing;

    const promise = this.doGenerate(companyId, role, type);
    this.generationLocks.set(lockKey, promise);

    try {
      return await promise;
    } finally {
      this.generationLocks.delete(lockKey);
    }
  }

  private async doGenerate(
    companyId: string,
    role: ExecutiveRole,
    type: BriefingType,
  ): Promise<ExecutiveBriefing> {
    const startTime = performance.now();
    const config = this.getConfig(companyId);
    const period = this.getPeriodKey(type);

    await briefingSectionGenerator.generateAll(companyId, role, config);

    const sections = await briefingSectionGenerator.generateAll(companyId, role, config);
    const generationTimeMs = Math.round(performance.now() - startTime);

    const briefing = briefingComposer.compose(companyId, role, type, sections, config, generationTimeMs);

    const ttlMap: Record<string, number> = {
      MORNING_BRIEFING: 12 * 3_600_000,
      EVENING_SUMMARY: 12 * 3_600_000,
      WEEKLY_EXECUTIVE_REVIEW: 3 * 86_400_000,
      MONTHLY_FINANCIAL_SUMMARY: 7 * 86_400_000,
      QUARTERLY_BUSINESS_REVIEW: 14 * 86_400_000,
      YEAR_END_EXECUTIVE_SUMMARY: 30 * 86_400_000,
    };

    briefingCache.set(companyId, role, type, period, briefing, ttlMap[type] ?? 3_600_000);
    return briefing;
  }

  async refresh(companyId: string, role: ExecutiveRole, type: BriefingType): Promise<ExecutiveBriefing> {
    const period = this.getPeriodKey(type);
    briefingCache.invalidateCompany(companyId);
    return this.generate(companyId, role, type);
  }

  setConfig(companyId: string, config: Partial<BriefingConfig>): void {
    const existing = this.configs.get(companyId) ?? { ...DEFAULT_BRIEFING_CONFIG, companyId };
    this.configs.set(companyId, { ...existing, ...config, companyId });
  }

  getConfig(companyId: string): BriefingConfig {
    return this.configs.get(companyId) ?? { ...DEFAULT_BRIEFING_CONFIG, companyId };
  }

  scheduleAll(companyId: string): void {
    const roles: ExecutiveRole[] = ["CFO", "TREASURER", "CONTROLLER", "FINANCE_MANAGER", "AUDITOR", "ADMINISTRATOR", "OPERATIONS"];

    for (const role of roles) {
      for (const bt of BRIEFING_TYPES) {
        briefingScheduler.schedule(companyId, role, bt.type);
      }
    }
  }

  unscheduleAll(companyId: string): void {
    briefingScheduler.unscheduleAll(companyId);
  }

  invalidateCache(companyId: string): void {
    briefingCache.invalidateCompany(companyId);
  }

  getCacheStats(): { size: number; totalAccesses: number } {
    return briefingCache.getStats();
  }

  private getPeriodKey(type: BriefingType): string {
    const now = new Date();
    switch (type) {
      case "MORNING_BRIEFING":
      case "EVENING_SUMMARY":
        return now.toISOString().slice(0, 10);
      case "WEEKLY_EXECUTIVE_REVIEW": {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay() + 1);
        return start.toISOString().slice(0, 10);
      }
      case "MONTHLY_FINANCIAL_SUMMARY":
        return now.toISOString().slice(0, 7);
      case "QUARTERLY_BUSINESS_REVIEW": {
        const q = Math.floor(now.getMonth() / 3) + 1;
        return `${now.getFullYear()}-Q${q}`;
      }
      case "YEAR_END_EXECUTIVE_SUMMARY":
        return `${now.getFullYear()}`;
    }
  }
}

export const executiveBriefingEngine = new ExecutiveBriefingEngine();
