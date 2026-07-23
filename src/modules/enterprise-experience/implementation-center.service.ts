import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  ImplementationMilestoneData,
  ImplementationProgressData,
  ImplementationSummary,
  MilestoneStatus,
  MilestoneCategory,
} from "./types";

interface MilestoneDef {
  slug: string;
  name: string;
  description: string;
  category: MilestoneCategory;
  order: number;
  isRequired: boolean;
  estimatedDays: number;
  dependsOn?: string;
}

const DEFAULT_MILESTONES: MilestoneDef[] = [
  { slug: "company-profile", name: "Company Profile", description: "Set up your company profile and legal entity information", category: "setup", order: 0, isRequired: true, estimatedDays: 1 },
  { slug: "fiscal-calendar", name: "Fiscal Calendar", description: "Configure fiscal year, periods, and close schedule", category: "setup", order: 1, isRequired: true, estimatedDays: 1, dependsOn: "company-profile" },
  { slug: "entity-creation", name: "Entity Creation", description: "Create legal entities and organizational structure", category: "setup", order: 2, isRequired: true, estimatedDays: 2, dependsOn: "fiscal-calendar" },
  { slug: "currency-config", name: "Currency Configuration", description: "Set up base currency and configure exchange rates", category: "setup", order: 3, isRequired: true, estimatedDays: 1, dependsOn: "entity-creation" },
  { slug: "chart-of-accounts", name: "Chart of Accounts", description: "Import or create your chart of accounts structure", category: "configuration", order: 4, isRequired: true, estimatedDays: 3, dependsOn: "entity-creation" },
  { slug: "tax-config", name: "Tax Configuration", description: "Configure tax rates, rules, and reporting categories", category: "configuration", order: 5, isRequired: false, estimatedDays: 2, dependsOn: "chart-of-accounts" },
  { slug: "approval-rules", name: "Approval Rules", description: "Define approval workflows and authorization thresholds", category: "configuration", order: 6, isRequired: true, estimatedDays: 2, dependsOn: "chart-of-accounts" },
  { slug: "policy-setup", name: "Policy Setup", description: "Create financial policies and compliance rules", category: "configuration", order: 7, isRequired: false, estimatedDays: 2, dependsOn: "approval-rules" },
  { slug: "erp-connection", name: "ERP Connection", description: "Connect your ERP system for automated data sync", category: "integration", order: 8, isRequired: true, estimatedDays: 3, dependsOn: "currency-config" },
  { slug: "bank-connection", name: "Bank Connection", description: "Connect bank accounts for real-time transaction data", category: "integration", order: 9, isRequired: true, estimatedDays: 2, dependsOn: "erp-connection" },
  { slug: "data-import", name: "Data Import", description: "Import historical data and open balances", category: "integration", order: 10, isRequired: true, estimatedDays: 2, dependsOn: "bank-connection" },
  { slug: "reconcile-balances", name: "Reconcile Balances", description: "Verify and reconcile opening balances across systems", category: "validation", order: 11, isRequired: true, estimatedDays: 2, dependsOn: "data-import" },
  { slug: "validation-summary", name: "Validation Summary", description: "Review validation results and resolve discrepancies", category: "validation", order: 12, isRequired: true, estimatedDays: 1, dependsOn: "reconcile-balances" },
  { slug: "user-acceptance", name: "User Acceptance Testing", description: "Key users validate system functionality and sign off", category: "validation", order: 13, isRequired: true, estimatedDays: 3, dependsOn: "validation-summary" },
  { slug: "launch-checklist", name: "Launch Checklist", description: "Complete final checks and go-live preparations", category: "go-live", order: 14, isRequired: true, estimatedDays: 1, dependsOn: "user-acceptance" },
];

export class ImplementationCenterService {
  static async initializeMilestones(ctx: TenantContext): Promise<ImplementationMilestoneData[]> {
    const results: ImplementationMilestoneData[] = [];
    for (const ms of DEFAULT_MILESTONES) {
      const record = await prisma.implementationMilestone.upsert({
        where: { companyId_slug: { companyId: ctx.companyId, slug: ms.slug } },
        create: {
          companyId: ctx.companyId,
          slug: ms.slug,
          name: ms.name,
          description: ms.description,
          category: ms.category,
          order: ms.order,
          isRequired: ms.isRequired,
          estimatedDays: ms.estimatedDays,
          dependsOn: ms.dependsOn,
        },
        update: {
          name: ms.name,
          description: ms.description,
          category: ms.category,
          order: ms.order,
          isRequired: ms.isRequired,
          estimatedDays: ms.estimatedDays,
          dependsOn: ms.dependsOn,
        },
      });
      results.push(record as unknown as ImplementationMilestoneData);
    }
    return results;
  }

  static async getProgress(ctx: TenantContext): Promise<ImplementationSummary> {
    const milestones = await prisma.implementationMilestone.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { order: "asc" },
    });

    const milestoneIds = milestones.map((m) => m.id);
    const progressRecords = await prisma.implementationProgress.findMany({
      where: {
        companyId: ctx.companyId,
        milestoneId: { in: milestoneIds },
      },
    });

    const progressByMilestone = new Map(progressRecords.map((p) => [p.milestoneId, p]));

    const bySlug = new Map(milestones.map((m) => [m.slug, m]));

    let completed = 0;
    let inProgress = 0;
    let blocked = 0;
    let skipped = 0;
    const total = milestones.length;

    for (const ms of milestones) {
      const prog = progressByMilestone.get(ms.id);
      const status = prog?.status ?? "pending";
      if (status === "completed") completed++;
      else if (status === "in_progress") inProgress++;
      else if (status === "blocked") blocked++;
      else if (status === "skipped") skipped++;
    }

    const findNext = (): string | null => {
      for (const ms of milestones) {
        const prog = progressByMilestone.get(ms.id);
        const status = prog?.status ?? "pending";
        if (status === "completed" || status === "skipped") continue;
        if (ms.dependsOn) {
          const dep = bySlug.get(ms.dependsOn);
          if (dep) {
            const depProg = progressByMilestone.get(dep.id);
            const depStatus = depProg?.status ?? "pending";
            if (depStatus !== "completed" && depStatus !== "skipped") continue;
          }
        }
        return ms.slug;
      }
      return null;
    };

    const nextRecommended = findNext();
    const remainingDays = milestones
      .filter((m) => {
        const prog = progressByMilestone.get(m.id);
        const status = prog?.status ?? "pending";
        return status !== "completed" && status !== "skipped";
      })
      .reduce((sum, m) => sum + (m.estimatedDays ?? 0), 0);

    return {
      total,
      completed,
      inProgress,
      blocked,
      skipped,
      percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
      nextRecommended,
      estimatedDaysRemaining: remainingDays,
    };
  }

  static async updateMilestoneStatus(
    ctx: TenantContext,
    milestoneId: string,
    status: MilestoneStatus,
    completedBy?: string,
    notes?: string,
  ): Promise<ImplementationProgressData> {
    const milestone = await prisma.implementationMilestone.findUnique({
      where: { id: milestoneId, companyId: ctx.companyId },
    });
    if (!milestone) throw new Error(`Milestone ${milestoneId} not found`);

    const record = await prisma.implementationProgress.upsert({
      where: { companyId_milestoneId: { companyId: ctx.companyId, milestoneId } },
      create: {
        companyId: ctx.companyId,
        milestoneId,
        status,
        completedAt: status === "completed" ? new Date() : null,
        completedBy: completedBy ?? null,
        notes: notes ?? null,
      },
      update: {
        status,
        ...(status === "completed" ? { completedAt: new Date() } : {}),
        ...(completedBy !== undefined ? { completedBy } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });
    return record as unknown as ImplementationProgressData;
  }

  static async listMilestones(ctx: TenantContext): Promise<(ImplementationMilestoneData & { progress: ImplementationProgressData | null })[]> {
    const milestones = await prisma.implementationMilestone.findMany({
      where: { companyId: ctx.companyId },
      include: { progress: true },
      orderBy: { order: "asc" },
    });
    return milestones.map((m) => ({
      ...(m as unknown as ImplementationMilestoneData),
      progress: (m.progress?.[0] ?? null) as unknown as ImplementationProgressData | null,
    }));
  }

  static async getMilestone(ctx: TenantContext, slug: string): Promise<(ImplementationMilestoneData & { progress: ImplementationProgressData | null }) | null> {
    const milestone = await prisma.implementationMilestone.findUnique({
      where: { companyId_slug: { companyId: ctx.companyId, slug } },
      include: { progress: true },
    });
    if (!milestone) return null;
    return {
      ...(milestone as unknown as ImplementationMilestoneData),
      progress: (milestone.progress?.[0] ?? null) as unknown as ImplementationProgressData | null,
    };
  }
}
