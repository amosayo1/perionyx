import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  CustomerSuccessResourceData,
  FeatureRequestData,
  SupportTicketData,
  TicketPriority,
  TicketStatus,
  ResourceType,
} from "./types";

interface ResourceDef {
  type: ResourceType;
  title: string;
  description: string;
  content: string;
  tags: string[];
  roleTarget?: string;
  order: number;
}

const DEFAULT_RESOURCES: ResourceDef[] = [
  { type: "documentation", title: "Getting Started Guide", description: "Complete guide to setting up your Vault instance", content: "# Getting Started\n\nWelcome to Vault. This guide will walk you through initial setup...", tags: ["setup", "onboarding", "getting-started"], roleTarget: "administrator", order: 0 },
  { type: "documentation", title: "Approval Workflows Reference", description: "Detailed documentation on configuring approval workflows", content: "# Approval Workflows\n\nVault supports multi-step, role-based approval chains...", tags: ["approvals", "workflows", "configuration"], roleTarget: "finance-manager", order: 1 },
  { type: "tutorial", title: "Connecting QuickBooks Online", description: "Step-by-step tutorial for QBO integration", content: "## Connect QuickBooks Online\n\n1. Navigate to Integrations\n2. Select QuickBooks...", tags: ["integration", "quickbooks", "erp"], roleTarget: "administrator", order: 2 },
  { type: "tutorial", title: "Running Your First Reconciliation", description: "Learn how to reconcile bank transactions", content: "## Reconciliation Tutorial\n\nThis tutorial covers importing statements...", tags: ["reconciliation", "tutorial", "banking"], roleTarget: "controller", order: 3 },
  { type: "release_note", title: "v1.2.0 — AI Insights & Forecasting", description: "New AI-powered features for financial forecasting", content: "## Release Notes v1.2.0\n\n### New Features\n- AI-powered cash flow forecasting...", tags: ["release", "ai", "forecasting"], order: 4 },
  { type: "release_note", title: "v1.1.0 — Enhanced Approval Workflows", description: "Multi-step approvals, delegation, and escalation", content: "## Release Notes v1.1.0\n\n### New Features\n- Sequential and parallel approval paths...", tags: ["release", "approvals", "workflows"], order: 5 },
  { type: "guide", title: "Best Practices for Multi-Currency Management", description: "Strategies for managing multiple currencies effectively", content: "# Multi-Currency Best Practices\n\nManaging multiple currencies requires careful attention...", tags: ["best-practices", "multi-currency", "treasury"], roleTarget: "treasurer", order: 6 },
  { type: "guide", title: "Month-End Close Checklist", description: "Comprehensive checklist for a smooth month-end close", content: "# Month-End Close Checklist\n\nFollow this checklist to ensure a complete and accurate close...", tags: ["close", "month-end", "checklist"], roleTarget: "controller", order: 7 },
  { type: "faq", title: "Account Setup & Configuration FAQ", description: "Frequently asked questions about initial setup", content: "## FAQ\n\n### How do I add users?\nNavigate to Settings > Users...", tags: ["faq", "setup", "account"], order: 8 },
  { type: "faq", title: "Troubleshooting Integration Errors", description: "Common integration issues and their solutions", content: "## Integration Troubleshooting\n\n### Connection Failed\nCheck your credentials and network access...", tags: ["faq", "integration", "troubleshooting"], order: 9 },
];

export class CustomerSuccessService {
  static async initializeResources(ctx: TenantContext): Promise<CustomerSuccessResourceData[]> {
    const results: CustomerSuccessResourceData[] = [];
    for (const res of DEFAULT_RESOURCES) {
      const record = await prisma.customerSuccessResource.create({
        data: {
          companyId: ctx.companyId,
          type: res.type,
          title: res.title,
          description: res.description,
          content: res.content,
          tags: res.tags as any,
          roleTarget: res.roleTarget,
          isPublished: true,
          order: res.order,
        },
      });
      results.push(record as unknown as CustomerSuccessResourceData);
    }
    return results;
  }

  static async listResources(
    ctx: TenantContext,
    opts?: { type?: string; role?: string; search?: string },
  ): Promise<CustomerSuccessResourceData[]> {
    const where: any = { companyId: ctx.companyId, isPublished: true };
    if (opts?.type) where.type = opts.type;
    if (opts?.role) where.roleTarget = opts.role;
    if (opts?.search) {
      where.OR = [
        { title: { contains: opts.search, mode: "insensitive" } },
        { description: { contains: opts.search, mode: "insensitive" } },
        { tags: { contains: opts.search } },
      ];
    }

    const records = await prisma.customerSuccessResource.findMany({
      where,
      orderBy: { order: "asc" },
    });
    return records as unknown as CustomerSuccessResourceData[];
  }

  static async getResource(ctx: TenantContext, id: string): Promise<CustomerSuccessResourceData | null> {
    const record = await prisma.customerSuccessResource.findUnique({
      where: { id, companyId: ctx.companyId },
    });
    return record as unknown as CustomerSuccessResourceData | null;
  }

  static async submitFeatureRequest(
    ctx: TenantContext,
    data: { userId: string; title: string; description?: string; category?: string },
  ): Promise<FeatureRequestData> {
    const record = await prisma.featureRequest.create({
      data: {
        companyId: ctx.companyId,
        userId: data.userId,
        title: data.title,
        description: data.description,
        category: data.category,
        status: "submitted",
        votes: 0,
        isPublic: false,
      },
    });
    return record as unknown as FeatureRequestData;
  }

  static async listFeatureRequests(ctx: TenantContext, status?: string): Promise<FeatureRequestData[]> {
    const where: any = { companyId: ctx.companyId };
    if (status) where.status = status;
    const records = await prisma.featureRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return records as unknown as FeatureRequestData[];
  }

  static async voteFeatureRequest(ctx: TenantContext, id: string): Promise<FeatureRequestData> {
    const record = await prisma.featureRequest.update({
      where: { id, companyId: ctx.companyId },
      data: { votes: { increment: 1 } },
    });
    return record as unknown as FeatureRequestData;
  }

  static async createTicket(
    ctx: TenantContext,
    data: {
      userId: string;
      subject: string;
      description?: string;
      category?: string;
      priority?: TicketPriority;
    },
  ): Promise<SupportTicketData> {
    const record = await prisma.supportTicket.create({
      data: {
        companyId: ctx.companyId,
        userId: data.userId,
        subject: data.subject,
        description: data.description,
        category: data.category,
        priority: data.priority ?? "normal",
        status: "open",
      },
    });
    return record as unknown as SupportTicketData;
  }

  static async listTickets(
    ctx: TenantContext,
    opts?: { status?: string; priority?: string },
  ): Promise<SupportTicketData[]> {
    const where: any = { companyId: ctx.companyId };
    if (opts?.status) where.status = opts.status;
    if (opts?.priority) where.priority = opts.priority;
    const records = await prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return records as unknown as SupportTicketData[];
  }

  static async updateTicket(
    ctx: TenantContext,
    id: string,
    data: { status?: TicketStatus; assignedTo?: string; resolution?: string },
  ): Promise<SupportTicketData> {
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
    if (data.resolution !== undefined) updateData.resolution = data.resolution;
    const record = await prisma.supportTicket.update({
      where: { id, companyId: ctx.companyId },
      data: updateData,
    });
    return record as unknown as SupportTicketData;
  }
}
