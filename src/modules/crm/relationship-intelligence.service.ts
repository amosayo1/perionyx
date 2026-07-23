import { prisma } from "@/server/db/prisma";
import type { CRMContact, RelationshipAnalytics, RelationshipStage, RelationshipHealth, StrategicImportance } from "./types";

function toPrismaStage(stage: RelationshipStage): string {
  const map: Record<string, string> = {
    "discovery-conversation": "DISCOVERY_CONVERSATION",
    "connected": "CONNECTED",
    "meeting-scheduled": "MEETING_SCHEDULED",
    "in-discussion": "IN_DISCUSSION",
    "evaluating": "EVALUATING",
    "committed": "COMMITTED",
    "partner": "PARTNER",
    "discovery": "DISCOVERY",
    "active-product-discovery": "ACTIVE_PRODUCT_DISCOVERY",
    "active-engagement": "ACTIVE_ENGAGEMENT",
    "warm-introduction": "WARM_INTRODUCTION",
  };
  return map[stage] ?? stage;
}

function fromPrismaStage(stage: string): RelationshipStage {
  const map: Record<string, RelationshipStage> = {
    "DISCOVERY_CONVERSATION": "discovery-conversation",
    "CONNECTED": "connected",
    "MEETING_SCHEDULED": "meeting-scheduled",
    "IN_DISCUSSION": "in-discussion",
    "EVALUATING": "evaluating",
    "COMMITTED": "committed",
    "PARTNER": "partner",
    "DISCOVERY": "discovery",
    "ACTIVE_PRODUCT_DISCOVERY": "active-product-discovery",
    "ACTIVE_ENGAGEMENT": "active-engagement",
    "WARM_INTRODUCTION": "warm-introduction",
  };
  return map[stage] ?? stage as RelationshipStage;
}

function fromPrismaHealth(health: string): RelationshipHealth {
  const map: Record<string, RelationshipHealth> = {
    "HEALTHY": "healthy",
    "NEEDS_ATTENTION": "needs-attention",
    "AT_RISK": "at-risk",
    "DORMANT": "dormant",
  };
  return map[health] ?? health as RelationshipHealth;
}

function fromPrismaImportance(importance: string): StrategicImportance {
  const map: Record<string, StrategicImportance> = {
    "CRITICAL": "critical",
    "HIGH": "high",
    "MEDIUM": "medium",
    "LOW": "low",
  };
  return map[importance] ?? importance as StrategicImportance;
}

function fromPrismaSource(source: string): string {
  const map: Record<string, string> = {
    "LINKEDIN": "linkedin",
    "EMAIL": "email",
    "REFERRAL": "referral",
    "EVENT": "event",
    "WEBSITE": "website",
  };
  return map[source] ?? source;
}

function fromPrismaClassification(cls: string | null): string | undefined {
  if (!cls) return undefined;
  const map: Record<string, string> = {
    "SUBJECT_MATTER_EXPERT": "subject-matter-expert",
    "SUBJECT_MATTER_EXPERT_PENDING": "subject-matter-expert-pending",
    "POTENTIAL_DESIGN_PARTNER": "potential-design-partner",
    "INDUSTRY_CONTACT": "industry-contact",
    "DESIGN_PARTNER": "design-partner",
  };
  return map[cls] ?? cls;
}

function fromPrismaDesignPotential(potential: string | null): string | undefined {
  if (!potential) return undefined;
  const map: Record<string, string> = {
    "HIGHEST": "highest",
    "VERY_HIGH": "very-high",
    "HIGH": "high",
    "MEDIUM": "medium",
    "LOW": "low",
  };
  return map[potential] ?? potential;
}

function fromPrismaStatus(status: string): string {
  const map: Record<string, string> = {
    "ACTIVE": "active",
    "INACTIVE": "inactive",
    "ARCHIVED": "archived",
  };
  return map[status] ?? status;
}

function mapContact(row: Record<string, unknown>): CRMContact {
  const raw = row as Record<string, unknown>;
  return {
    id: raw.id as string,
    name: raw.name as string,
    role: raw.role as string,
    company: raw.company as string | undefined,
    source: fromPrismaSource(raw.source as string) as CRMContact["source"],
    relationshipStage: fromPrismaStage(raw.relationshipStage as string),
    status: fromPrismaStatus(raw.status as string) as CRMContact["status"],
    expertise: raw.expertise as string[],
    tags: raw.tags as string[],
    notes: raw.notes as string,
    isStrategicAdvisor: raw.isStrategicAdvisor as boolean,
    location: raw.location as string | undefined,
    whatsapp: raw.whatsapp as string | undefined,
    priority: raw.priority as "low" | "medium" | "high" | undefined,
    region: raw.region as string | undefined,
    relationshipType: raw.relationshipType as string | undefined,
    potentialRoles: raw.potentialRoles as string[] | undefined,
    classification: fromPrismaClassification(raw.classification as string | null) as CRMContact["classification"],
    designPartnerPotential: fromPrismaDesignPotential(raw.designPartnerPotential as string | null) as CRMContact["designPartnerPotential"],
    productModules: raw.productModules as string[] | undefined,
    conversationSummary: raw.conversationSummary as string | undefined,
    keyProductInsights: raw.keyProductInsights as string[] | undefined,
    preferredLanguage: raw.preferredLanguage as string | undefined,
    industryExperience: raw.industryExperience as string[] | undefined,
    potentialContributions: raw.potentialContributions as string[] | undefined,
    recommendedNextSteps: raw.recommendedNextSteps as string[] | undefined,
    nextFollowUp: raw.nextFollowUp ? (raw.nextFollowUp as Date).toISOString() : undefined,
    conversationStatus: raw.conversationStatus as string | undefined,
    relationshipStrength: raw.relationshipStrength as number | undefined,
    trustScore: raw.trustScore as number | undefined,
    engagementLevel: raw.engagementLevel as string | undefined,
    championPotential: raw.championPotential as boolean | undefined,
    advisorPotential: raw.advisorPotential as boolean | undefined,
    investorPotential: raw.investorPotential as boolean | undefined,
    pilotCustomerPotential: raw.pilotCustomerPotential as boolean | undefined,
    referralPotential: raw.referralPotential as boolean | undefined,
    hiringPotential: raw.hiringPotential as boolean | undefined,
    strategicImportance: raw.strategicImportance ? fromPrismaImportance(raw.strategicImportance as string) : undefined,
    lastMeaningfulConversation: raw.lastMeaningfulConversation ? (raw.lastMeaningfulConversation as Date).toISOString() : undefined,
    nextRecommendedAction: raw.nextRecommendedAction as string | undefined,
    relationshipHealth: raw.relationshipHealth ? fromPrismaHealth(raw.relationshipHealth as string) : undefined,
    createdAt: raw.createdAt as Date,
    updatedAt: raw.updatedAt as Date,
  };
}

export class RelationshipIntelligenceService {
  async getRelationshipAnalytics(companyId: string): Promise<RelationshipAnalytics> {
    const contacts = await prisma.contact.findMany({
      where: { companyId },
      select: {
        relationshipStage: true,
        relationshipHealth: true,
        strategicImportance: true,
        region: true,
        professionalProfile: { select: { industry: true } },
      },
    });

    const byStage: Record<string, number> = {};
    const byHealth: Record<string, number> = {};
    const byImportance: Record<string, number> = {};
    const byIndustry: Record<string, number> = {};
    const byRegion: Record<string, number> = {};

    for (const c of contacts) {
      const stage = fromPrismaStage(c.relationshipStage);
      byStage[stage] = (byStage[stage] || 0) + 1;

      if (c.relationshipHealth) {
        const health = fromPrismaHealth(c.relationshipHealth);
        byHealth[health] = (byHealth[health] || 0) + 1;
      }

      if (c.strategicImportance) {
        const imp = fromPrismaImportance(c.strategicImportance);
        byImportance[imp] = (byImportance[imp] || 0) + 1;
      }

      if (c.professionalProfile?.industry) {
        byIndustry[c.professionalProfile.industry] = (byIndustry[c.professionalProfile.industry] || 0) + 1;
      }

      if (c.region) {
        byRegion[c.region] = (byRegion[c.region] || 0) + 1;
      }
    }

    const topPainPoints = await this.getTopPainPoints(companyId, 10);
    const voCInsights = await this.getVoCInsightsSummary(companyId);
    const discoveryProgress = await this.getDiscoveryProgress(companyId);

    return {
      totalContacts: contacts.length,
      byStage,
      byHealth,
      byImportance,
      byIndustry,
      byRegion,
      topPainPoints,
      voCInsights,
      discoveryProgress,
    };
  }

  async getTopPainPoints(companyId: string, limit = 10): Promise<Array<{ category: string; count: number; trend: string }>> {
    const results = await prisma.painPoint.groupBy({
      by: ["category", "trend"],
      where: { contact: { companyId } },
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
      take: limit,
    });

    return results.map((r) => ({
      category: r.category.toLowerCase().replace(/_/g, "-"),
      count: r._count.category,
      trend: r.trend || "stable",
    }));
  }

  async getVoCInsightsSummary(companyId: string): Promise<{ total: number; completed: number; byType: Record<string, number>; topFeatures: Array<{ feature: string; count: number }> }> {
    const insights = await prisma.voiceOfCustomerInsight.findMany({
      where: { contact: { companyId } },
      select: { interviewType: true, interviewStatus: true, featureRequest: true },
    });

    const byType: Record<string, number> = {};
    let completed = 0;

    for (const i of insights) {
      if (i.interviewType) {
        const type = i.interviewType.toLowerCase();
        byType[type] = (byType[type] || 0) + 1;
      }
      if (i.interviewStatus === "COMPLETED") {
        completed++;
      }
    }

    const featureCounts = new Map<string, number>();
    for (const i of insights) {
      if (i.featureRequest) {
        featureCounts.set(i.featureRequest, (featureCounts.get(i.featureRequest) || 0) + 1);
      }
    }

    const topFeatures = [...featureCounts.entries()]
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total: insights.length,
      completed,
      byType,
      topFeatures,
    };
  }

  async getDiscoveryProgress(companyId: string): Promise<{ total: number; byStage: Record<string, number>; pendingFollowUp: number }> {
    const sessions = await prisma.productDiscoverySession.findMany({
      where: { contact: { companyId } },
      select: { discoveryStage: true, followUpRequired: true },
    });

    const byStage: Record<string, number> = {};
    for (const s of sessions) {
      if (s.discoveryStage) {
        const stage = s.discoveryStage.toLowerCase().replace(/_/g, "-");
        byStage[stage] = (byStage[stage] || 0) + 1;
      }
    }

    const pendingFollowUp = sessions.filter((s) => s.followUpRequired).length;

    return {
      total: sessions.length,
      byStage,
      pendingFollowUp,
    };
  }

  async searchContacts(companyId: string, query: string, filters?: { industry?: string; region?: string; relationshipStage?: string }): Promise<CRMContact[]> {
    const where: Record<string, unknown> = {
      companyId,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { role: { contains: query, mode: "insensitive" } },
        { company: { contains: query, mode: "insensitive" } },
        { tags: { has: query } },
        { expertise: { has: query } },
        { notes: { contains: query, mode: "insensitive" } },
      ],
    };

    if (filters) {
      if (filters.region) {
        where.region = filters.region;
      }
      if (filters.relationshipStage) {
        where.relationshipStage = toPrismaStage(filters.relationshipStage as RelationshipStage);
      }
      if (filters.industry) {
        where.professionalProfile = { industry: filters.industry };
      }
    }

    const rows = await prisma.contact.findMany({
      where: where as any,
      include: { professionalProfile: true },
    });

    return rows.map(mapContact);
  }

  async getContactFullProfile(contactId: string, companyId: string): Promise<{
    contact: CRMContact;
    interactions: unknown[];
    opportunities: unknown[];
    tasks: unknown[];
    intelligence: unknown;
    insights: unknown[];
    painPoints: unknown[];
    discoverySessions: unknown[];
    timelineEvents: unknown[];
    knowledgeGraph: unknown[];
  }> {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, companyId },
    });

    if (!contact) {
      throw new Error("Contact not found");
    }

    const [interactions, opportunities, tasks, intelligence, insights, painPoints, discoverySessions, timelineEvents, knowledgeGraph] = await Promise.all([
      prisma.interaction.findMany({ where: { contactId } }),
      prisma.opportunity.findMany({ where: { contactId } }),
      prisma.task.findMany({ where: { contactId } }),
      prisma.contactIntelligence.findUnique({ where: { contactId } }),
      prisma.voiceOfCustomerInsight.findMany({ where: { contactId } }),
      prisma.painPoint.findMany({ where: { contactId } }),
      prisma.productDiscoverySession.findMany({ where: { contactId } }),
      prisma.timelineEvent.findMany({ where: { contactId } }),
      prisma.crmKnowledgeLink.findMany({
        where: {
          OR: [{ sourceContactId: contactId }, { targetContactId: contactId }],
        },
      }),
    ]);

    return {
      contact: mapContact(contact as unknown as Record<string, unknown>),
      interactions,
      opportunities,
      tasks,
      intelligence,
      insights,
      painPoints,
      discoverySessions,
      timelineEvents,
      knowledgeGraph,
    };
  }

  async updateRelationshipIntelligence(contactId: string, companyId: string, data: Partial<CRMContact>): Promise<CRMContact> {
    const existing = await prisma.contact.findFirst({
      where: { id: contactId, companyId },
      select: { id: true },
    });
    if (!existing) throw new Error("Contact not found");

    const updateData: Record<string, unknown> = {};

    if (data.relationshipHealth !== undefined) {
      updateData.relationshipHealth = data.relationshipHealth.toUpperCase().replace(/-/g, "_");
    }
    if (data.strategicImportance !== undefined) {
      updateData.strategicImportance = data.strategicImportance.toUpperCase();
    }
    if (data.relationshipStrength !== undefined) updateData.relationshipStrength = data.relationshipStrength;
    if (data.trustScore !== undefined) updateData.trustScore = data.trustScore;
    if (data.engagementLevel !== undefined) updateData.engagementLevel = data.engagementLevel;
    if (data.championPotential !== undefined) updateData.championPotential = data.championPotential;
    if (data.advisorPotential !== undefined) updateData.advisorPotential = data.advisorPotential;
    if (data.investorPotential !== undefined) updateData.investorPotential = data.investorPotential;
    if (data.pilotCustomerPotential !== undefined) updateData.pilotCustomerPotential = data.pilotCustomerPotential;
    if (data.referralPotential !== undefined) updateData.referralPotential = data.referralPotential;
    if (data.hiringPotential !== undefined) updateData.hiringPotential = data.hiringPotential;
    if (data.lastMeaningfulConversation !== undefined) {
      updateData.lastMeaningfulConversation = data.lastMeaningfulConversation ? new Date(data.lastMeaningfulConversation) : null;
    }
    if (data.nextRecommendedAction !== undefined) updateData.nextRecommendedAction = data.nextRecommendedAction;
    if (data.classification !== undefined) {
      updateData.classification = data.classification?.toUpperCase().replace(/-/g, "_") ?? null;
    }
    if (data.designPartnerPotential !== undefined) {
      updateData.designPartnerPotential = data.designPartnerPotential?.toUpperCase().replace(/-/g, "_") ?? null;
    }
    if (data.relationshipStage !== undefined) {
      updateData.relationshipStage = toPrismaStage(data.relationshipStage as RelationshipStage);
    }
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.region !== undefined) updateData.region = data.region;
    if (data.conversationSummary !== undefined) updateData.conversationSummary = data.conversationSummary;
    if (data.conversationStatus !== undefined) updateData.conversationStatus = data.conversationStatus;
    if (data.nextFollowUp !== undefined) {
      updateData.nextFollowUp = data.nextFollowUp ? new Date(data.nextFollowUp) : null;
    }
    if (data.recommendedNextSteps !== undefined) updateData.recommendedNextSteps = data.recommendedNextSteps;
    if (data.potentialContributions !== undefined) updateData.potentialContributions = data.potentialContributions;

    const updated = await prisma.contact.update({
      where: { id: contactId },
      data: updateData,
    });

    return mapContact(updated as unknown as Record<string, unknown>);
  }

  async getTopDesignPartners(companyId: string, limit = 10): Promise<CRMContact[]> {
    const rows = await prisma.contact.findMany({
      where: {
        companyId,
        OR: [
          { classification: "DESIGN_PARTNER" },
          { classification: "POTENTIAL_DESIGN_PARTNER" },
        ],
      },
      orderBy: [
        { designPartnerPotential: "asc" },
        { relationshipStrength: { sort: "desc", nulls: "last" } },
      ],
      take: limit,
    });

    return rows.map(mapContact);
  }

  async getMostValuableRelationships(companyId: string, limit = 10): Promise<CRMContact[]> {
    const rows = await prisma.contact.findMany({
      where: {
        companyId,
        strategicImportance: { in: ["CRITICAL", "HIGH"] },
      },
      orderBy: [
        { trustScore: { sort: "desc", nulls: "last" } },
        { relationshipStrength: { sort: "desc", nulls: "last" } },
      ],
      take: limit,
    });

    return rows.map(mapContact);
  }

  async getMostActiveIndustries(companyId: string): Promise<Array<{ industry: string; count: number }>> {
    const profiles = await prisma.professionalProfile.findMany({
      where: { contact: { companyId } },
      select: { industry: true },
    });

    const counts = new Map<string, number>();
    for (const p of profiles) {
      if (p.industry) {
        counts.set(p.industry, (counts.get(p.industry) || 0) + 1);
      }
    }

    return [...counts.entries()]
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getRelationshipFunnel(companyId: string): Promise<Array<{ stage: string; count: number }>> {
    const results = await prisma.contact.groupBy({
      by: ["relationshipStage"],
      where: { companyId },
      _count: { relationshipStage: true },
      orderBy: { _count: { relationshipStage: "desc" } },
    });

    return results.map((r) => ({
      stage: fromPrismaStage(r.relationshipStage),
      count: r._count.relationshipStage,
    }));
  }
}

export const relationshipIntelligenceService = new RelationshipIntelligenceService();
