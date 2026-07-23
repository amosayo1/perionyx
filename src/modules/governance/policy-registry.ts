import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import type { PolicyRegistryEntry, PolicyMappingType } from "./types";
import { NotFoundError, ConflictError } from "@/lib/errors/app-error";

export class PolicyRegistry {
  static async listPolicies(ctx: TenantContext, opts?: { limit?: number; offset?: number }): Promise<PolicyRegistryEntry[]> {
    const policies = await prisma.policy.findMany({
      where: { companyId: ctx.companyId },
      take: opts?.limit ?? 100,
      skip: opts?.offset ?? 0,
      orderBy: { updatedAt: "desc" },
    });

    if (policies.length === 0) return [];

    const policyIds = policies.map((p) => p.id);
    const frameworkPolicies = await prisma.governanceFrameworkPolicy.findMany({
      where: { policyId: { in: policyIds }, framework: { companyId: ctx.companyId } },
      include: { framework: { select: { name: true } } },
    });

    const policyToFramework = new Map<string, string>();
    for (const fp of frameworkPolicies) {
      policyToFramework.set(fp.policyId, fp.framework.name);
    }

    return policies.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      source: "organization" as const,
      enabled: p.enabled,
      priority: p.priority,
      framework: policyToFramework.get(p.id),
    }));
  }

  static async getFrameworks(ctx: TenantContext, opts?: { limit?: number; offset?: number }) {
    return prisma.governanceFramework.findMany({
      where: { companyId: ctx.companyId },
      take: opts?.limit ?? 50,
      skip: opts?.offset ?? 0,
      orderBy: { name: "asc" },
    });
  }

  static async createFramework(
    ctx: TenantContext,
    data: { name: string; description?: string; category?: string },
  ) {
    const framework = await prisma.governanceFramework.create({
      data: {
        companyId: ctx.companyId,
        name: data.name,
        description: data.description,
        category: data.category ?? "internal",
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "GOVERNANCE_FRAMEWORK_CREATED",
      resourceType: "GovernanceFramework", resourceId: framework.id,
      metadata: { name: data.name },
    });

    return framework;
  }

  static async linkPolicyToFramework(
    ctx: TenantContext,
    frameworkId: string,
    policyId: string,
    mappingType: PolicyMappingType = "MANDATORY",
  ) {
    const link = await prisma.governanceFrameworkPolicy.create({
      data: { frameworkId, policyId, mappingType },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "GOVERNANCE_POLICY_LINKED",
      resourceType: "GovernanceFrameworkPolicy", resourceId: link.id,
      metadata: { frameworkId, policyId, mappingType },
    });

    return link;
  }

  static async unlinkPolicyFromFramework(ctx: TenantContext, linkId: string) {
    await prisma.governanceFrameworkPolicy.delete({ where: { id: linkId } });

    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "GOVERNANCE_POLICY_UNLINKED",
      resourceType: "GovernanceFrameworkPolicy", resourceId: linkId,
    });
  }

  static async updateFrameworkStatus(
    ctx: TenantContext,
    frameworkId: string,
    status: string,
  ) {
    const existing = await prisma.governanceFramework.findUnique({
      where: { id: frameworkId },
    });
    if (!existing) throw new NotFoundError("GovernanceFramework");

    const result = await prisma.governanceFramework.updateMany({
      where: { id: frameworkId, version: existing.version },
      data: { status, version: { increment: 1 } },
    });
    if (result.count === 0) {
      throw new ConflictError("Concurrent modification detected — governance framework was updated by another request.");
    }

    return (await prisma.governanceFramework.findUnique({ where: { id: frameworkId } }))!;
  }
}
