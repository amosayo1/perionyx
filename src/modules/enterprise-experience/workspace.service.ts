import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { WorkspaceData, WorkspaceSlug } from "./types";

const DEFAULT_WORKSPACES: {
  slug: WorkspaceSlug;
  name: string;
  description: string;
  icon: string;
  order: number;
}[] = [
  { slug: "treasury", name: "Treasury", description: "Cash positioning, transfers, and liquidity management", icon: "Landmark", order: 0 },
  { slug: "month-end", name: "Month-End Close", description: "Close management, reconciliations, and checklists", icon: "CalendarCheck", order: 1 },
  { slug: "reporting", name: "Reporting", description: "Financial reports, board packs, and analytics", icon: "BarChart3", order: 2 },
  { slug: "audit", name: "Audit", description: "Audit trail, compliance checks, and evidence management", icon: "SearchCheck", order: 3 },
  { slug: "procurement", name: "Procurement", description: "Vendor management, purchase orders, and approvals", icon: "ShoppingCart", order: 4 },
  { slug: "cash-management", name: "Cash Management", description: "Daily cash positioning, forecasting, and optimization", icon: "Wallet", order: 5 },
  { slug: "financial-ops", name: "Financial Operations", description: "AP/AR, reconciliations, and financial controls", icon: "Building2", order: 6 },
];

export class WorkspaceService {
  static async initialize(ctx: TenantContext): Promise<WorkspaceData[]> {
    const results: WorkspaceData[] = [];
    for (const ws of DEFAULT_WORKSPACES) {
      const record = await prisma.workspace.upsert({
        where: { companyId_slug: { companyId: ctx.companyId, slug: ws.slug } },
        create: {
          companyId: ctx.companyId,
          slug: ws.slug,
          name: ws.name,
          description: ws.description,
          icon: ws.icon,
          order: ws.order,
          isDefault: true,
          isActive: true,
        },
        update: {
          name: ws.name,
          description: ws.description,
          icon: ws.icon,
          order: ws.order,
        },
      });
      results.push(record as unknown as WorkspaceData);
    }
    return results;
  }

  static async list(ctx: TenantContext): Promise<WorkspaceData[]> {
    const records = await prisma.workspace.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { order: "asc" },
    });
    return records as unknown as WorkspaceData[];
  }

  static async get(ctx: TenantContext, slug: string): Promise<WorkspaceData | null> {
    const record = await prisma.workspace.findUnique({
      where: { companyId_slug: { companyId: ctx.companyId, slug } },
    });
    return record as unknown as WorkspaceData | null;
  }

  static async update(
    ctx: TenantContext,
    slug: string,
    data: Partial<Pick<WorkspaceData, "name" | "description" | "icon" | "isActive" | "config">>,
  ): Promise<WorkspaceData> {
    const record = await prisma.workspace.update({
      where: { companyId_slug: { companyId: ctx.companyId, slug } },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.config !== undefined && { config: data.config as any }),
      },
    });
    return record as unknown as WorkspaceData;
  }

  static async getConfig(ctx: TenantContext, slug: string): Promise<Record<string, unknown> | null> {
    const record = await prisma.workspace.findUnique({
      where: { companyId_slug: { companyId: ctx.companyId, slug } },
      select: { config: true },
    });
    return (record?.config as Record<string, unknown> | null) ?? null;
  }
}
