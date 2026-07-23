import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  AdoptionEventData,
  AdoptionEventType,
  AdoptionCategory,
  UserAdoptionData,
  AdoptionScoreData,
} from "./types";

export class AdoptionAnalyticsService {
  static async trackEvent(
    ctx: TenantContext,
    data: {
      userId: string;
      eventType: AdoptionEventType;
      category: AdoptionCategory;
      key: string;
      label?: string;
      metadata?: Record<string, unknown>;
      durationMs?: number;
    },
  ): Promise<AdoptionEventData> {
    const record = await prisma.adoptionEvent.create({
      data: {
        companyId: ctx.companyId,
        userId: data.userId,
        eventType: data.eventType,
        category: data.category,
        key: data.key,
        label: data.label,
        metadata: (data.metadata ?? {}) as any,
        durationMs: data.durationMs,
      },
    });
    return record as unknown as AdoptionEventData;
  }

  static async getUserAdoption(ctx: TenantContext, userId: string): Promise<UserAdoptionData> {
    const [events, user] = await Promise.all([
      prisma.adoptionEvent.findMany({
        where: { companyId: ctx.companyId, userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      }),
    ]);

    const typed = events as unknown as AdoptionEventData[];

    const workspacesUsed = [...new Set(typed.filter((e) => e.category === "workspace").map((e) => e.key))];
    const featuresUsed = [...new Set(typed.filter((e) => e.category === "feature").map((e) => e.key))];
    const totalEvents = typed.length;
    const lastActive = typed.length > 0 ? typed[0].createdAt : new Date().toISOString();

    const roleBaseScore = 20;
    const eventScore = Math.min(totalEvents * 2, 40);
    const workspaceScore = Math.min(workspacesUsed.length * 5, 20);
    const featureScore = Math.min(featuresUsed.length * 5, 20);
    const score = Math.min(roleBaseScore + eventScore + workspaceScore + featureScore, 100);

    return {
      userId: user?.id ?? userId,
      userName: user?.name ?? "Unknown",
      email: user?.email ?? "",
      lastActive,
      totalEvents,
      workspacesUsed,
      featuresUsed,
      score,
    };
  }

  static async getCompanyScore(ctx: TenantContext): Promise<AdoptionScoreData | null> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const record = await prisma.adoptionScore.findFirst({
      where: {
        companyId: ctx.companyId,
        periodStart: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: "desc" },
    });
    return record as unknown as AdoptionScoreData | null;
  }

  static async computeScore(ctx: TenantContext): Promise<AdoptionScoreData> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const periodStart = new Date(thirtyDaysAgo);
    periodStart.setHours(0, 0, 0, 0);
    const periodEnd = new Date(now);
    periodEnd.setHours(23, 59, 59, 999);

    const [events, memberCount] = await Promise.all([
      prisma.adoptionEvent.findMany({
        where: {
          companyId: ctx.companyId,
          createdAt: { gte: periodStart },
        },
      }),
      prisma.companyMembership.count({
        where: { companyId: ctx.companyId },
      }),
    ]);

    const typed = events as unknown as AdoptionEventData[];

    const uniqueUsers = new Set(typed.map((e) => e.userId));
    const activeUsers = uniqueUsers.size;
    const totalUsers = memberCount;

    const featureUsage: Record<string, number> = {};
    const workspaceEngagement: Record<string, number> = {};
    for (const ev of typed) {
      if (ev.category === "feature") {
        featureUsage[ev.key] = (featureUsage[ev.key] ?? 0) + 1;
      }
      if (ev.category === "workspace") {
        workspaceEngagement[ev.key] = (workspaceEngagement[ev.key] ?? 0) + 1;
      }
    }

    const allFeatures = await prisma.featureFlag.findMany({
      where: { companyId: ctx.companyId },
      select: { slug: true },
    });
    const unusedFeatures = allFeatures
      .map((f) => f.slug)
      .filter((slug) => !featureUsage[slug]);

    const userAdoption: Record<string, number> = {};
    for (const userId of uniqueUsers) {
      const userEvents = typed.filter((e) => e.userId === userId).length;
      userAdoption[userId] = Math.min(Math.round((userEvents / 100) * 100), 100);
    }

    const adoptionRate = totalUsers > 0 ? activeUsers / totalUsers : 0;
    const featureDiversity = Object.keys(featureUsage).length;
    const workspaceDiversity = Object.keys(workspaceEngagement).length;

    const overallScore = Math.min(
      Math.round(
        adoptionRate * 30 +
          Math.min(featureDiversity * 5, 25) +
          Math.min(workspaceDiversity * 5, 20) +
          Math.min(typed.length / 10, 25),
      ),
      100,
    );

    const recommendations: string[] = [];
    if (adoptionRate < 0.5) {
      recommendations.push("Encourage team members to log in and explore the platform");
    }
    if (unusedFeatures.length > 0) {
      recommendations.push(`Introduce unused features: ${unusedFeatures.slice(0, 5).join(", ")}`);
    }
    if (workspaceDiversity < 3) {
      recommendations.push("Explore additional workspaces to expand platform usage");
    }

    const record = await prisma.adoptionScore.create({
      data: {
        companyId: ctx.companyId,
        periodStart,
        periodEnd,
        overallScore,
        userAdoption: userAdoption as any,
        featureUsage: featureUsage as any,
        workspaceEngagement: workspaceEngagement as any,
        activeUsers,
        totalUsers,
        unusedFeatures: unusedFeatures as any,
        recommendations: recommendations as any,
      },
    });

    return record as unknown as AdoptionScoreData;
  }

  static async getEventHistory(
    ctx: TenantContext,
    opts?: {
      userId?: string;
      eventType?: string;
      category?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ events: AdoptionEventData[]; total: number }> {
    const where: any = { companyId: ctx.companyId };
    if (opts?.userId) where.userId = opts.userId;
    if (opts?.eventType) where.eventType = opts.eventType;
    if (opts?.category) where.category = opts.category;

    const [events, total] = await Promise.all([
      prisma.adoptionEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: opts?.limit ?? 50,
        skip: opts?.offset ?? 0,
      }),
      prisma.adoptionEvent.count({ where }),
    ]);

    return { events: events as unknown as AdoptionEventData[], total };
  }
}
