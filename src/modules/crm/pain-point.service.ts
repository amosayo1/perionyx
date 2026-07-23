import { prisma } from "@/server/db/prisma";
import type { PainPoint, PainPointCategory } from "./types";

function fromPrismaCategory(category: string): PainPointCategory {
  const map: Record<string, PainPointCategory> = {
    "MONTH_END_CLOSE": "month-end-close",
    "RECONCILIATION": "reconciliation",
    "TREASURY": "treasury",
    "APPROVALS": "approvals",
    "REPORTING": "reporting",
    "FP_A": "fp&a",
    "TAX": "tax",
    "AUDIT": "audit",
    "COMPLIANCE": "compliance",
    "CASH_MANAGEMENT": "cash-management",
    "ERP": "erp",
    "INTEGRATION": "integration",
    "WORKFLOW": "workflow",
    "COLLABORATION": "collaboration",
    "DATA_COLLECTION": "data-collection",
    "INTERNAL_CONTROLS": "internal-controls",
    "ANALYTICS": "analytics",
    "AI": "ai",
    "AUTOMATION": "automation",
    "OTHER": "other",
  };
  return map[category] ?? category as PainPointCategory;
}

function toPrismaCategory(category: PainPointCategory): string {
  const map: Record<string, string> = {
    "month-end-close": "MONTH_END_CLOSE",
    "reconciliation": "RECONCILIATION",
    "treasury": "TREASURY",
    "approvals": "APPROVALS",
    "reporting": "REPORTING",
    "fp&a": "FP_A",
    "tax": "TAX",
    "audit": "AUDIT",
    "compliance": "COMPLIANCE",
    "cash-management": "CASH_MANAGEMENT",
    "erp": "ERP",
    "integration": "INTEGRATION",
    "workflow": "WORKFLOW",
    "collaboration": "COLLABORATION",
    "data-collection": "DATA_COLLECTION",
    "internal-controls": "INTERNAL_CONTROLS",
    "analytics": "ANALYTICS",
    "ai": "AI",
    "automation": "AUTOMATION",
    "other": "OTHER",
  };
  return map[category] ?? category;
}

function jsonToStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return []; }
  }
  return [];
}

function mapPainPoint(row: Record<string, unknown>): PainPoint {
  const raw = row as Record<string, unknown>;
  return {
    id: raw.id as string,
    category: fromPrismaCategory(raw.category as string),
    subcategory: raw.subcategory as string | undefined,
    frequency: raw.frequency as string | undefined,
    severity: raw.severity as string | undefined,
    trend: raw.trend as string | undefined,
    industries: jsonToStringArray(raw.industries),
    roles: jsonToStringArray(raw.roles),
    companies: jsonToStringArray(raw.companies),
    contactId: raw.contactId as string | undefined,
    insightId: raw.insightId as string | undefined,
    firstMention: raw.firstMention ? (raw.firstMention as Date).toISOString() : undefined,
    latestMention: raw.latestMention ? (raw.latestMention as Date).toISOString() : undefined,
    supportingQuotes: jsonToStringArray(raw.supportingQuotes),
    linkedProductAreas: jsonToStringArray(raw.linkedProductAreas),
    roadmapItems: jsonToStringArray(raw.roadmapItems),
    createdAt: raw.createdAt as Date,
    updatedAt: raw.updatedAt as Date,
  };
}

export class PainPointService {
  async create(data: Omit<PainPoint, "id" | "createdAt" | "updatedAt">): Promise<PainPoint> {
    const prismaData: Record<string, unknown> = {
      ...data,
      category: toPrismaCategory(data.category),
    };

    if (data.industries) prismaData.industries = data.industries;
    if (data.roles) prismaData.roles = data.roles;
    if (data.companies) prismaData.companies = data.companies;
    if (data.supportingQuotes) prismaData.supportingQuotes = data.supportingQuotes;
    if (data.linkedProductAreas) prismaData.linkedProductAreas = data.linkedProductAreas;
    if (data.roadmapItems) prismaData.roadmapItems = data.roadmapItems;
    if (data.firstMention) prismaData.firstMention = new Date(data.firstMention);
    if (data.latestMention) prismaData.latestMention = new Date(data.latestMention);

    const created = await prisma.painPoint.create({
      data: prismaData as Parameters<typeof prisma.painPoint.create>[0]["data"],
    });

    return mapPainPoint(created as unknown as Record<string, unknown>);
  }

  async getById(id: string): Promise<PainPoint | null> {
    const row = await prisma.painPoint.findUnique({ where: { id } });
    return row ? mapPainPoint(row as unknown as Record<string, unknown>) : null;
  }

  async update(id: string, data: Partial<PainPoint>): Promise<PainPoint> {
    const prismaData: Record<string, unknown> = {};

    if (data.category !== undefined) prismaData.category = toPrismaCategory(data.category);
    if (data.subcategory !== undefined) prismaData.subcategory = data.subcategory;
    if (data.frequency !== undefined) prismaData.frequency = data.frequency;
    if (data.severity !== undefined) prismaData.severity = data.severity;
    if (data.trend !== undefined) prismaData.trend = data.trend;
    if (data.industries !== undefined) prismaData.industries = data.industries;
    if (data.roles !== undefined) prismaData.roles = data.roles;
    if (data.companies !== undefined) prismaData.companies = data.companies;
    if (data.contactId !== undefined) prismaData.contactId = data.contactId;
    if (data.insightId !== undefined) prismaData.insightId = data.insightId;
    if (data.firstMention !== undefined) {
      prismaData.firstMention = data.firstMention ? new Date(data.firstMention) : null;
    }
    if (data.latestMention !== undefined) {
      prismaData.latestMention = data.latestMention ? new Date(data.latestMention) : null;
    }
    if (data.supportingQuotes !== undefined) prismaData.supportingQuotes = data.supportingQuotes;
    if (data.linkedProductAreas !== undefined) prismaData.linkedProductAreas = data.linkedProductAreas;
    if (data.roadmapItems !== undefined) prismaData.roadmapItems = data.roadmapItems;

    const updated = await prisma.painPoint.update({
      where: { id },
      data: prismaData,
    });

    return mapPainPoint(updated as unknown as Record<string, unknown>);
  }

  async delete(id: string): Promise<void> {
    await prisma.painPoint.delete({ where: { id } });
  }

  async list(filters?: { category?: string; severity?: string; trend?: string; contactId?: string }): Promise<PainPoint[]> {
    const where: Record<string, unknown> = {};

    if (filters?.category) where.category = toPrismaCategory(filters.category as PainPointCategory);
    if (filters?.severity) where.severity = filters.severity;
    if (filters?.trend) where.trend = filters.trend;
    if (filters?.contactId) where.contactId = filters.contactId;

    const rows = await prisma.painPoint.findMany({
      where: where as any,
    });

    return rows.map((r) => mapPainPoint(r as unknown as Record<string, unknown>));
  }

  async getTopPainPoints(limit = 10): Promise<Array<{ category: string; count: number; severity: string; trend: string }>> {
    const results = await prisma.painPoint.groupBy({
      by: ["category", "severity", "trend"],
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
      take: limit,
    });

    return results.map((r) => ({
      category: fromPrismaCategory(r.category),
      count: r._count.category,
      severity: r.severity || "unknown",
      trend: r.trend || "stable",
    }));
  }

  async getFastestGrowingPainPoints(limit = 10): Promise<Array<{ category: string; count: number }>> {
    const results = await prisma.painPoint.groupBy({
      by: ["category"],
      where: { trend: "growing" },
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
      take: limit,
    });

    return results.map((r) => ({
      category: fromPrismaCategory(r.category),
      count: r._count.category,
    }));
  }

  async getPainPointsByIndustry(industry: string): Promise<PainPoint[]> {
    const rows = await prisma.painPoint.findMany({
      where: { industries: { path: "$", string_contains: industry } } as any,
    });
    return rows.map((r) => mapPainPoint(r as unknown as Record<string, unknown>));
  }

  async getPainPointsByRole(role: string): Promise<PainPoint[]> {
    const rows = await prisma.painPoint.findMany({
      where: { roles: { path: "$", string_contains: role } } as any,
    });
    return rows.map((r) => mapPainPoint(r as unknown as Record<string, unknown>));
  }

  async getPainPointsByCompany(company: string): Promise<PainPoint[]> {
    const rows = await prisma.painPoint.findMany({
      where: { companies: { path: "$", string_contains: company } } as any,
    });
    return rows.map((r) => mapPainPoint(r as unknown as Record<string, unknown>));
  }

  async getPainPointsByGeography(region: string): Promise<PainPoint[]> {
    const rows = await prisma.painPoint.findMany({
      where: {
        contact: { region },
      },
    });
    return rows.map((r) => mapPainPoint(r as unknown as Record<string, unknown>));
  }

  async getPainPointsByCompanySize(size: string): Promise<PainPoint[]> {
    const rows = await prisma.painPoint.findMany({
      where: {
        contact: {
          professionalProfile: { companySize: size },
        },
      },
    });
    return rows.map((r) => mapPainPoint(r as unknown as Record<string, unknown>));
  }

  async getMostMentionedERP(limit = 5): Promise<Array<{ erp: string; count: number }>> {
    const rows = await prisma.painPoint.findMany({
      select: { companies: true },
      where: { category: "ERP" },
    });

    const erpCounts = new Map<string, number>();
    for (const r of rows) {
      const companies = jsonToStringArray(r.companies);
      for (const company of companies) {
        if (company.trim()) {
          erpCounts.set(company, (erpCounts.get(company) || 0) + 1);
        }
      }
    }

    return [...erpCounts.entries()]
      .map(([erp, count]) => ({ erp, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

export const painPointService = new PainPointService();
