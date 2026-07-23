import { prisma } from "@/server/db/prisma";
import type { KnowledgeGraphLink } from "./types";

function mapLink(row: Record<string, unknown>): KnowledgeGraphLink {
  const raw = row as Record<string, unknown>;
  return {
    id: raw.id as string,
    sourceContactId: raw.sourceContactId as string,
    targetContactId: raw.targetContactId as string | undefined,
    targetCompany: raw.targetCompany as string | undefined,
    targetIndustry: raw.targetIndustry as string | undefined,
    targetPainPoint: raw.targetPainPoint as string | undefined,
    targetErp: raw.targetErp as string | undefined,
    targetWorkflow: raw.targetWorkflow as string | undefined,
    targetModule: raw.targetModule as string | undefined,
    targetFeature: raw.targetFeature as string | undefined,
    targetRoadmap: raw.targetRoadmap as string | undefined,
    targetConstitution: raw.targetConstitution as string | undefined,
    targetInterview: raw.targetInterview as string | undefined,
    targetRecommendation: raw.targetRecommendation as string | undefined,
    linkType: raw.linkType as string,
    strength: raw.strength as number | undefined,
    description: raw.description as string | undefined,
    createdAt: raw.createdAt as Date,
  };
}

export class KnowledgeGraphService {
  async create(data: Omit<KnowledgeGraphLink, "id" | "createdAt">): Promise<KnowledgeGraphLink> {
    const created = await prisma.crmKnowledgeLink.create({
      data: data as Parameters<typeof prisma.crmKnowledgeLink.create>[0]["data"],
    });

    return mapLink(created as unknown as Record<string, unknown>);
  }

  async getById(id: string): Promise<KnowledgeGraphLink | null> {
    const row = await prisma.crmKnowledgeLink.findUnique({ where: { id } });
    return row ? mapLink(row as unknown as Record<string, unknown>) : null;
  }

  async delete(id: string): Promise<void> {
    await prisma.crmKnowledgeLink.delete({ where: { id } });
  }

  async list(filters?: { sourceContactId?: string; targetContactId?: string; linkType?: string }): Promise<KnowledgeGraphLink[]> {
    const where: Record<string, unknown> = {};

    if (filters?.sourceContactId) where.sourceContactId = filters.sourceContactId;
    if (filters?.targetContactId) where.targetContactId = filters.targetContactId;
    if (filters?.linkType) where.linkType = filters.linkType;

    const rows = await prisma.crmKnowledgeLink.findMany({
      where: where as any,
    });

    return rows.map((r) => mapLink(r as unknown as Record<string, unknown>));
  }

  async getContactGraph(contactId: string): Promise<KnowledgeGraphLink[]> {
    const rows = await prisma.crmKnowledgeLink.findMany({
      where: {
        OR: [{ sourceContactId: contactId }, { targetContactId: contactId }],
      },
    });

    return rows.map((r) => mapLink(r as unknown as Record<string, unknown>));
  }

  async getGraphData(): Promise<{
    nodes: Array<{ id: string; label: string; type: string }>;
    links: Array<{ source: string; target: string; type: string; strength?: number }>;
  }> {
    const contacts = await prisma.contact.findMany({
      select: { id: true, name: true },
    });

    const links = await prisma.crmKnowledgeLink.findMany({
      include: {
        sourceContact: { select: { name: true, company: true } },
        targetContact: { select: { name: true, company: true } },
      },
    });

    const nodeSet = new Set<string>();
    const nodes: Array<{ id: string; label: string; type: string }> = [];

    for (const c of contacts) {
      if (!nodeSet.has(c.id)) {
        nodeSet.add(c.id);
        nodes.push({ id: c.id, label: c.name, type: "contact" });
      }
    }

    for (const link of links) {
      if (!nodeSet.has(link.sourceContactId)) {
        nodeSet.add(link.sourceContactId);
        nodes.push({
          id: link.sourceContactId,
          label: link.sourceContact.name,
          type: "contact",
        });
      }
      if (link.targetContactId && !nodeSet.has(link.targetContactId)) {
        nodeSet.add(link.targetContactId);
        nodes.push({
          id: link.targetContactId,
          label: link.targetContact?.name || link.targetContactId,
          type: "contact",
        });
      }
      if (link.targetCompany && !nodeSet.has(`company:${link.targetCompany}`)) {
        nodeSet.add(`company:${link.targetCompany}`);
        nodes.push({
          id: `company:${link.targetCompany}`,
          label: link.targetCompany,
          type: "company",
        });
      }
      if (link.targetIndustry && !nodeSet.has(`industry:${link.targetIndustry}`)) {
        nodeSet.add(`industry:${link.targetIndustry}`);
        nodes.push({
          id: `industry:${link.targetIndustry}`,
          label: link.targetIndustry,
          type: "industry",
        });
      }
    }

    const resultLinks: Array<{ source: string; target: string; type: string; strength?: number }> = [];

    for (const link of links) {
      if (link.targetContactId) {
        resultLinks.push({
          source: link.sourceContactId,
          target: link.targetContactId,
          type: link.linkType,
          strength: link.strength ?? undefined,
        });
      }
      if (link.targetCompany) {
        resultLinks.push({
          source: link.sourceContactId,
          target: `company:${link.targetCompany}`,
          type: "works-at",
          strength: link.strength ?? undefined,
        });
      }
      if (link.targetIndustry) {
        resultLinks.push({
          source: link.sourceContactId,
          target: `industry:${link.targetIndustry}`,
          type: "industry",
          strength: link.strength ?? undefined,
        });
      }
    }

    return { nodes, links: resultLinks };
  }
}

export const knowledgeGraphService = new KnowledgeGraphService();
