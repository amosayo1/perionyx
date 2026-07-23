import { prisma } from "@/server/db/prisma";
import type { VoiceOfCustomerInsight, InterviewType, InterviewStatus } from "./types";

function fromPrismaInterviewType(type: string | null): InterviewType | undefined {
  if (!type) return undefined;
  const map: Record<string, InterviewType> = {
    "DISCOVERY": "discovery",
    "DEMO": "demo",
    "FEEDBACK": "feedback",
    "WORKSHOP": "workshop",
    "PRODUCT_REVIEW": "product-review",
    "CONFERENCE": "conference",
    "CALL": "call",
  };
  return map[type] ?? type as InterviewType;
}

function toPrismaInterviewType(type: InterviewType | undefined): string | undefined {
  if (!type) return undefined;
  const map: Record<string, string> = {
    "discovery": "DISCOVERY",
    "demo": "DEMO",
    "feedback": "FEEDBACK",
    "workshop": "WORKSHOP",
    "product-review": "PRODUCT_REVIEW",
    "conference": "CONFERENCE",
    "call": "CALL",
  };
  return map[type] ?? type;
}

function fromPrismaInterviewStatus(status: string | null): InterviewStatus | undefined {
  if (!status) return undefined;
  const map: Record<string, InterviewStatus> = {
    "SCHEDULED": "scheduled",
    "COMPLETED": "completed",
    "CANCELLED": "cancelled",
    "FOLLOW_UP": "follow-up",
  };
  return map[status] ?? status as InterviewStatus;
}

function toPrismaInterviewStatus(status: InterviewStatus | undefined): string | undefined {
  if (!status) return undefined;
  const map: Record<string, string> = {
    "scheduled": "SCHEDULED",
    "completed": "COMPLETED",
    "cancelled": "CANCELLED",
    "follow-up": "FOLLOW_UP",
  };
  return map[status] ?? status;
}

function mapInsight(row: Record<string, unknown>): VoiceOfCustomerInsight {
  const raw = row as Record<string, unknown>;
  return {
    id: raw.id as string,
    contactId: raw.contactId as string,
    painPoint: raw.painPoint as string | undefined,
    desiredOutcome: raw.desiredOutcome as string | undefined,
    currentProcess: raw.currentProcess as string | undefined,
    manualWork: raw.manualWork as string | undefined,
    workaround: raw.workaround as string | undefined,
    featureRequest: raw.featureRequest as string | undefined,
    idea: raw.idea as string | undefined,
    opportunity: raw.opportunity as string | undefined,
    risk: raw.risk as string | undefined,
    quote: raw.quote as string | undefined,
    evidence: raw.evidence as string | undefined,
    confidenceLevel: raw.confidenceLevel as string | undefined,
    interviewDate: raw.interviewDate ? (raw.interviewDate as Date).toISOString() : undefined,
    interviewType: fromPrismaInterviewType(raw.interviewType as string | null),
    interviewStatus: fromPrismaInterviewStatus(raw.interviewStatus as string | null),
    createdAt: raw.createdAt as Date,
    updatedAt: raw.updatedAt as Date,
  };
}

export class VoiceOfCustomerService {
  async createInsight(data: Omit<VoiceOfCustomerInsight, "id" | "createdAt" | "updatedAt">): Promise<VoiceOfCustomerInsight> {
    const prismaData: Record<string, unknown> = { ...data };

    if (data.interviewType) {
      prismaData.interviewType = toPrismaInterviewType(data.interviewType);
    }
    if (data.interviewStatus) {
      prismaData.interviewStatus = toPrismaInterviewStatus(data.interviewStatus);
    }
    if (data.interviewDate) {
      prismaData.interviewDate = new Date(data.interviewDate);
    }

    const created = await prisma.voiceOfCustomerInsight.create({
      data: prismaData as Parameters<typeof prisma.voiceOfCustomerInsight.create>[0]["data"],
    });

    return mapInsight(created as unknown as Record<string, unknown>);
  }

  async getInsight(id: string): Promise<VoiceOfCustomerInsight | null> {
    const row = await prisma.voiceOfCustomerInsight.findUnique({ where: { id } });
    return row ? mapInsight(row as unknown as Record<string, unknown>) : null;
  }

  async getContactInsights(contactId: string): Promise<VoiceOfCustomerInsight[]> {
    const rows = await prisma.voiceOfCustomerInsight.findMany({ where: { contactId } });
    return rows.map((r) => mapInsight(r as unknown as Record<string, unknown>));
  }

  async updateInsight(id: string, data: Partial<VoiceOfCustomerInsight>): Promise<VoiceOfCustomerInsight> {
    const prismaData: Record<string, unknown> = {};

    if (data.painPoint !== undefined) prismaData.painPoint = data.painPoint;
    if (data.desiredOutcome !== undefined) prismaData.desiredOutcome = data.desiredOutcome;
    if (data.currentProcess !== undefined) prismaData.currentProcess = data.currentProcess;
    if (data.manualWork !== undefined) prismaData.manualWork = data.manualWork;
    if (data.workaround !== undefined) prismaData.workaround = data.workaround;
    if (data.featureRequest !== undefined) prismaData.featureRequest = data.featureRequest;
    if (data.idea !== undefined) prismaData.idea = data.idea;
    if (data.opportunity !== undefined) prismaData.opportunity = data.opportunity;
    if (data.risk !== undefined) prismaData.risk = data.risk;
    if (data.quote !== undefined) prismaData.quote = data.quote;
    if (data.evidence !== undefined) prismaData.evidence = data.evidence;
    if (data.confidenceLevel !== undefined) prismaData.confidenceLevel = data.confidenceLevel;
    if (data.interviewDate !== undefined) {
      prismaData.interviewDate = data.interviewDate ? new Date(data.interviewDate) : null;
    }
    if (data.interviewType !== undefined) {
      prismaData.interviewType = data.interviewType ? toPrismaInterviewType(data.interviewType) : null;
    }
    if (data.interviewStatus !== undefined) {
      prismaData.interviewStatus = data.interviewStatus ? toPrismaInterviewStatus(data.interviewStatus) : null;
    }

    const updated = await prisma.voiceOfCustomerInsight.update({
      where: { id },
      data: prismaData,
    });

    return mapInsight(updated as unknown as Record<string, unknown>);
  }

  async deleteInsight(id: string): Promise<void> {
    await prisma.voiceOfCustomerInsight.delete({ where: { id } });
  }

  async getAllInsights(filters?: { interviewType?: string; interviewStatus?: string; contactId?: string }): Promise<VoiceOfCustomerInsight[]> {
    const where: Record<string, unknown> = {};

    if (filters?.contactId) {
      where.contactId = filters.contactId;
    }
    if (filters?.interviewType) {
      const map: Record<string, string> = {
        "discovery": "DISCOVERY",
        "demo": "DEMO",
        "feedback": "FEEDBACK",
        "workshop": "WORKSHOP",
        "product-review": "PRODUCT_REVIEW",
        "conference": "CONFERENCE",
        "call": "CALL",
      };
      where.interviewType = map[filters.interviewType] ?? filters.interviewType;
    }
    if (filters?.interviewStatus) {
      const map: Record<string, string> = {
        "scheduled": "SCHEDULED",
        "completed": "COMPLETED",
        "cancelled": "CANCELLED",
        "follow-up": "FOLLOW_UP",
      };
      where.interviewStatus = map[filters.interviewStatus] ?? filters.interviewStatus;
    }

    const rows = await prisma.voiceOfCustomerInsight.findMany({
      where: where as any,
    });

    return rows.map((r) => mapInsight(r as unknown as Record<string, unknown>));
  }

  async getTopFeatureRequests(limit = 10): Promise<Array<{ feature: string; count: number }>> {
    const insights = await prisma.voiceOfCustomerInsight.findMany({
      select: { featureRequest: true },
      where: { featureRequest: { not: null } },
    });

    const counts = new Map<string, number>();
    for (const i of insights) {
      if (i.featureRequest) {
        counts.set(i.featureRequest, (counts.get(i.featureRequest) || 0) + 1);
      }
    }

    return [...counts.entries()]
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getMostCommonManualProcesses(limit = 10): Promise<Array<{ process: string; count: number }>> {
    const insights = await prisma.voiceOfCustomerInsight.findMany({
      select: { manualWork: true },
      where: { manualWork: { not: null } },
    });

    const counts = new Map<string, number>();
    for (const i of insights) {
      if (i.manualWork) {
        counts.set(i.manualWork, (counts.get(i.manualWork) || 0) + 1);
      }
    }

    return [...counts.entries()]
      .map(([process, count]) => ({ process, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getInterviewActivity(startDate?: Date, endDate?: Date): Promise<Array<{ date: string; count: number }>> {
    const where: Record<string, unknown> = {
      interviewStatus: "COMPLETED",
    };

    if (startDate || endDate) {
      where.interviewDate = {};
      if (startDate) (where.interviewDate as Record<string, unknown>).gte = startDate;
      if (endDate) (where.interviewDate as Record<string, unknown>).lte = endDate;
    }

    const insights = await prisma.voiceOfCustomerInsight.findMany({
      select: { interviewDate: true },
      where: where as any,
    });

    const counts = new Map<string, number>();
    for (const i of insights) {
      if (i.interviewDate) {
        const dateKey = i.interviewDate.toISOString().split("T")[0];
        counts.set(dateKey, (counts.get(dateKey) || 0) + 1);
      }
    }

    return [...counts.entries()]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

export const voiceOfCustomerService = new VoiceOfCustomerService();
