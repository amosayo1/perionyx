import { prisma } from "@/server/db/prisma";
import type { ProductDiscoverySession, DiscoveryStage } from "./types";

function fromPrismaDiscoveryStage(stage: string | null): DiscoveryStage | undefined {
  if (!stage) return undefined;
  const map: Record<string, DiscoveryStage> = {
    "RESEARCH": "research",
    "CONTACTED": "contacted",
    "INTRODUCTORY_CALL": "introductory-call",
    "DISCOVERY_SESSION": "discovery-session",
    "WORKSHOP": "workshop",
    "PILOT": "pilot",
    "REVIEW": "review",
    "COMPLETED": "completed",
  };
  return map[stage] ?? stage as DiscoveryStage;
}

function toPrismaDiscoveryStage(stage: DiscoveryStage | undefined): string | undefined {
  if (!stage) return undefined;
  const map: Record<string, string> = {
    "research": "RESEARCH",
    "contacted": "CONTACTED",
    "introductory-call": "INTRODUCTORY_CALL",
    "discovery-session": "DISCOVERY_SESSION",
    "workshop": "WORKSHOP",
    "pilot": "PILOT",
    "review": "REVIEW",
    "completed": "COMPLETED",
  };
  return map[stage] ?? stage;
}

function jsonToStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return []; }
  }
  return [];
}

function mapSession(row: Record<string, unknown>): ProductDiscoverySession {
  const raw = row as Record<string, unknown>;
  return {
    id: raw.id as string,
    contactId: raw.contactId as string,
    discoveryStage: fromPrismaDiscoveryStage(raw.discoveryStage as string | null),
    interviewGoals: jsonToStringArray(raw.interviewGoals),
    interviewQuestions: jsonToStringArray(raw.interviewQuestions),
    interviewNotes: raw.interviewNotes as string | undefined,
    keyLearnings: jsonToStringArray(raw.keyLearnings),
    followUpRequired: raw.followUpRequired as boolean,
    featureRequests: jsonToStringArray(raw.featureRequests),
    workflowInsights: jsonToStringArray(raw.workflowInsights),
    automationOpportunities: jsonToStringArray(raw.automationOpportunities),
    designObservations: jsonToStringArray(raw.designObservations),
    constitutionReferences: jsonToStringArray(raw.constitutionReferences),
    roadmapLinks: jsonToStringArray(raw.roadmapLinks),
    createdAt: raw.createdAt as Date,
    updatedAt: raw.updatedAt as Date,
  };
}

export class ProductDiscoveryService {
  async create(data: Omit<ProductDiscoverySession, "id" | "createdAt" | "updatedAt">): Promise<ProductDiscoverySession> {
    const prismaData: Record<string, unknown> = { ...data };

    if (data.discoveryStage) {
      prismaData.discoveryStage = toPrismaDiscoveryStage(data.discoveryStage);
    }
    if (data.interviewGoals) prismaData.interviewGoals = data.interviewGoals;
    if (data.interviewQuestions) prismaData.interviewQuestions = data.interviewQuestions;
    if (data.keyLearnings) prismaData.keyLearnings = data.keyLearnings;
    if (data.featureRequests) prismaData.featureRequests = data.featureRequests;
    if (data.workflowInsights) prismaData.workflowInsights = data.workflowInsights;
    if (data.automationOpportunities) prismaData.automationOpportunities = data.automationOpportunities;
    if (data.designObservations) prismaData.designObservations = data.designObservations;
    if (data.constitutionReferences) prismaData.constitutionReferences = data.constitutionReferences;
    if (data.roadmapLinks) prismaData.roadmapLinks = data.roadmapLinks;

    const created = await prisma.productDiscoverySession.create({
      data: prismaData as Parameters<typeof prisma.productDiscoverySession.create>[0]["data"],
    });

    return mapSession(created as unknown as Record<string, unknown>);
  }

  async getById(id: string): Promise<ProductDiscoverySession | null> {
    const row = await prisma.productDiscoverySession.findUnique({ where: { id } });
    return row ? mapSession(row as unknown as Record<string, unknown>) : null;
  }

  async update(id: string, data: Partial<ProductDiscoverySession>): Promise<ProductDiscoverySession> {
    const prismaData: Record<string, unknown> = {};

    if (data.discoveryStage !== undefined) {
      prismaData.discoveryStage = data.discoveryStage ? toPrismaDiscoveryStage(data.discoveryStage) : null;
    }
    if (data.interviewGoals !== undefined) prismaData.interviewGoals = data.interviewGoals;
    if (data.interviewQuestions !== undefined) prismaData.interviewQuestions = data.interviewQuestions;
    if (data.interviewNotes !== undefined) prismaData.interviewNotes = data.interviewNotes;
    if (data.keyLearnings !== undefined) prismaData.keyLearnings = data.keyLearnings;
    if (data.followUpRequired !== undefined) prismaData.followUpRequired = data.followUpRequired;
    if (data.featureRequests !== undefined) prismaData.featureRequests = data.featureRequests;
    if (data.workflowInsights !== undefined) prismaData.workflowInsights = data.workflowInsights;
    if (data.automationOpportunities !== undefined) prismaData.automationOpportunities = data.automationOpportunities;
    if (data.designObservations !== undefined) prismaData.designObservations = data.designObservations;
    if (data.constitutionReferences !== undefined) prismaData.constitutionReferences = data.constitutionReferences;
    if (data.roadmapLinks !== undefined) prismaData.roadmapLinks = data.roadmapLinks;

    const updated = await prisma.productDiscoverySession.update({
      where: { id },
      data: prismaData,
    });

    return mapSession(updated as unknown as Record<string, unknown>);
  }

  async delete(id: string): Promise<void> {
    await prisma.productDiscoverySession.delete({ where: { id } });
  }

  async list(filters?: { contactId?: string; discoveryStage?: string }): Promise<ProductDiscoverySession[]> {
    const where: Record<string, unknown> = {};

    if (filters?.contactId) where.contactId = filters.contactId;
    if (filters?.discoveryStage) {
      where.discoveryStage = toPrismaDiscoveryStage(filters.discoveryStage as DiscoveryStage);
    }

    const rows = await prisma.productDiscoverySession.findMany({
      where: where as any,
    });

    return rows.map((r) => mapSession(r as unknown as Record<string, unknown>));
  }

  async getContactSessions(contactId: string): Promise<ProductDiscoverySession[]> {
    const rows = await prisma.productDiscoverySession.findMany({
      where: { contactId },
    });
    return rows.map((r) => mapSession(r as unknown as Record<string, unknown>));
  }

  async getWorkflowInsights(contactId?: string): Promise<Array<{ insight: string; count: number }>> {
    const where: Record<string, unknown> = {};
    if (contactId) where.contactId = contactId;

    const sessions = await prisma.productDiscoverySession.findMany({
      select: { workflowInsights: true },
      where: where as any,
    });

    const counts = new Map<string, number>();
    for (const s of sessions) {
      const insights = jsonToStringArray(s.workflowInsights);
      for (const insight of insights) {
        if (insight.trim()) {
          counts.set(insight, (counts.get(insight) || 0) + 1);
        }
      }
    }

    return [...counts.entries()]
      .map(([insight, count]) => ({ insight, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getAutomationOpportunities(contactId?: string): Promise<Array<{ opportunity: string; count: number }>> {
    const where: Record<string, unknown> = {};
    if (contactId) where.contactId = contactId;

    const sessions = await prisma.productDiscoverySession.findMany({
      select: { automationOpportunities: true },
      where: where as any,
    });

    const counts = new Map<string, number>();
    for (const s of sessions) {
      const opportunities = jsonToStringArray(s.automationOpportunities);
      for (const opp of opportunities) {
        if (opp.trim()) {
          counts.set(opp, (counts.get(opp) || 0) + 1);
        }
      }
    }

    return [...counts.entries()]
      .map(([opportunity, count]) => ({ opportunity, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getDesignObservations(contactId?: string): Promise<Array<{ observation: string; count: number }>> {
    const where: Record<string, unknown> = {};
    if (contactId) where.contactId = contactId;

    const sessions = await prisma.productDiscoverySession.findMany({
      select: { designObservations: true },
      where: where as any,
    });

    const counts = new Map<string, number>();
    for (const s of sessions) {
      const observations = jsonToStringArray(s.designObservations);
      for (const obs of observations) {
        if (obs.trim()) {
          counts.set(obs, (counts.get(obs) || 0) + 1);
        }
      }
    }

    return [...counts.entries()]
      .map(([observation, count]) => ({ observation, count }))
      .sort((a, b) => b.count - a.count);
  }
}

export const productDiscoveryService = new ProductDiscoveryService();
